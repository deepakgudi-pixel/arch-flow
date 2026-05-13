import express from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import pool from '../db/pool.js';
import { clerkAuth, optionalAuth } from '../middleware/clerkAuth.js';
import { validate } from '../middleware/validate.js';
import { ensureUserExists } from '../services/userSync.js';
import { logger } from '../lib/logger.js';
import { redis } from '../lib/redis.js';
import { 
  builtInTech, 
  getTechDescription, 
  getCategoryProducts,
  categorizeTech
} from '../lib/tech.js';
import {
  buildDiagramReviewContext,
  normalizeProtocolLabel,
  normalizeReviewSuggestion,
  normalizeReviewText,
  REVIEW_NEW_NODE_TOKEN,
  VALID_TECH_CATEGORIES,
} from '../lib/reviewDiagram.js';
import { callOpenRouterForJSON, DIAGRAM_MODEL, TECH_MODEL } from '../lib/openRouter.js';
import { buildDiagramUserMessage, generateDiagramFromPrompt } from '../lib/diagramGenerator.js';
import { recordAIFailure } from '../lib/aiFailures.js';

const router = express.Router();

import { RedisStore } from 'rate-limit-redis';

const DIAGRAM_REVIEW_MODEL = process.env.OPENROUTER_REVIEW_MODEL || TECH_MODEL;
const GENERATION_CACHE_VERSION = 'review-safe-v2';

function normalizeTechName(name) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w.+/-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many requests. Please slow down and synchronize with the mainframe later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  store: (redis.isAvailable() && redis.getClient())
    ? new RedisStore({ sendCommand: (...args) => redis.getClient().sendCommand(args), prefix: 'rl:ai:' })
    : undefined,
});

// In-memory cache (Layer 1 - Local Instance)
const localCache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const MAX_LOCAL_SIZE = 50;

async function addToCache(key, value) {
  // 1. Update Local
  if (localCache.size >= MAX_LOCAL_SIZE) {
    const firstKey = localCache.keys().next().value;
    localCache.delete(firstKey);
  }
  localCache.set(key, { data: value, timestamp: Date.now() });

  // 2. Update Redis (Layer 2 - Global)
  await redis.set(`ai_diag:${key}`, JSON.stringify(value), 3600);
}

async function autoRegisterTech(user, nodes) {
  const userId = user.id;
  await ensureUserExists(user);

  const allBuiltInNames = new Set(
    Object.values(builtInTech)
      .flat()
      .map(t => t.name.toLowerCase())
  );

  // Filter to only nodes that aren't built-ins and have a name
  const newNodes = nodes.filter(node => {
    const nodeName = String(node.name || '').trim();
    return nodeName && !allBuiltInNames.has(nodeName.toLowerCase());
  });

  if (newNodes.length === 0) return;

  // Build a single bulk upsert
  const values = [];
  const params = [];
  let paramIndex = 1;

  for (const node of newNodes) {
    const nodeName = String(node.name || '').trim();
    const id = crypto.randomUUID();
    params.push(
      id,
      userId,
      nodeName,
      node.category || 'backend',
      node.role || `Automated technical module for ${nodeName}`,
      JSON.stringify(node.products || []),
      node.icon || 'tech'
    );
    values.push(
      `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
    );
  }

  try {
    await pool.query(
      `INSERT INTO user_inventory (id, user_id, name, category, description, products, icon)
       VALUES ${values.join(', ')}
       ON CONFLICT (user_id, name) DO NOTHING`,
      params
    );
  } catch (err) {
    logger.error('TECH_AUTO_REGISTER_FAILED', { error: err.message, nodeCount: newNodes.length });
  }
}

router.post('/generate-diagram', aiLimiter, optionalAuth, validate({
  description: { required: true, type: 'string', maxLength: 2000 },
  template: { type: 'string', maxLength: 50 },
  diagramId: { type: 'string', maxLength: 50 }
}), async (req, res) => {
  const { description, template, diagramId } = req.body;
  const userMessage = buildDiagramUserMessage(description, template);

  // 1. In-memory Cache check (Layer 1 - Local Instance)
  const cacheKey = crypto.createHash('sha256').update(`${GENERATION_CACHE_VERSION}:${userMessage}`).digest('hex');
  const localCached = localCache.get(cacheKey);
  if (localCached && (Date.now() - localCached.timestamp < CACHE_TTL)) {
    logger.cacheMetrics('LOCAL_GET', cacheKey, true);
    // Move to end for LRU
    localCache.delete(cacheKey);
    localCache.set(cacheKey, localCached);
    return res.json(localCached.data);
  }

  // 2. Redis Cache check (Layer 2 - Global)
  const redisCached = await redis.get(`ai_diag:${cacheKey}`);
  if (redisCached) {
    const data = typeof redisCached === 'string' ? JSON.parse(redisCached) : redisCached;
    logger.cacheMetrics('REDIS_GET', cacheKey, true);
    // Backfill local cache
    localCache.set(cacheKey, { data, timestamp: Date.now() });
    return res.json(data);
  }

  // 3. Database Persistent Cache check (Layer 3 - Persistence)
  try {
    const dbCached = await pool.query(
      'SELECT nodes, edges FROM diagram_versions WHERE prompt_hash = $1 ORDER BY created_at DESC LIMIT 1',
      [cacheKey]
    );

    if (dbCached.rows.length > 0) {
      const result = {
        nodes: dbCached.rows[0].nodes,
        edges: dbCached.rows[0].edges,
        is_persistent_hit: true
      };
      logger.cacheMetrics('DB_GET', cacheKey, true);
      // Backfill higher tiers
      addToCache(cacheKey, result);
      return res.json(result);
    }
  } catch (dbErr) {
    logger.error('Persistent cache lookup failed', { error: dbErr.message, prompt_hash: cacheKey });
  }

  logger.cacheMetrics('GLOBAL_MISS', cacheKey, false);

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  let responseText = '';
  const abortController = new AbortController();
  req.on('close', () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  });

  try {
    const startAI = Date.now();
    const generatedDiagram = await generateDiagramFromPrompt({
      description,
      template,
      model: DIAGRAM_MODEL,
      onChunk: (chunk) => {
        if (res.destroyed || res.writableEnded) return;
        responseText += chunk;
        sendEvent('chunk', { content: chunk });
      },
      signal: abortController.signal
    });
    responseText = generatedDiagram.rawResponse;
    const duration = Date.now() - startAI;

    logger.aiInteraction({
      model: DIAGRAM_MODEL,
      prompt_hash: cacheKey,
      duration_ms: duration,
      status: 'SUCCESS',
      is_cached: false
    });

    const result = {
      nodes: generatedDiagram.nodes,
      edges: generatedDiagram.edges,
      ...(generatedDiagram.quality && { quality: generatedDiagram.quality }),
      ...(generatedDiagram.autoFixes && { autoFixes: generatedDiagram.autoFixes })
    };

    // Auto-register new tech to community inventory if user is logged in
    if (req.user) {
      try {
        await autoRegisterTech(req.user, result.nodes);
      } catch (regErr) {
        logger.error('Tech auto-registration failed', { error: regErr.message });
      }
    }

    // Persistent storage (Versioning + Caching)
    try {
      await pool.query(
        `INSERT INTO diagram_versions (diagram_id, prompt_hash, prompt_text, nodes, edges, raw_response)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          diagramId || null,
          cacheKey,
          `AI_SYNTHESIS: ${description}`,
          JSON.stringify(result.nodes),
          JSON.stringify(result.edges),
          responseText
        ]
      );
    } catch (vErr) {
      logger.error('Failed to save diagram version', { error: vErr.message, diagramId });
    }

    // Update cache
    addToCache(cacheKey, result);

    sendEvent('result', result);
    res.end();
  } catch (err) {
    logger.error('Error generating diagram', { 
      error: err.message, 
      partial_response_length: responseText.length 
    });
    await recordAIFailure({
      kind: 'generate-diagram',
      model: DIAGRAM_MODEL,
      inputPayload: { description, template, diagramId },
      rawResponse: responseText,
      errorMessage: err.message
    });

    // Even on error, save partial if it exists
    if (responseText.length > 50) {
      try {
        await pool.query(
          `INSERT INTO diagram_versions (diagram_id, prompt_hash, prompt_text, nodes, edges, raw_response)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [diagramId || null, cacheKey, description, '[]', '[]', responseText]
        );
      } catch (saveErr) {
        logger.error('Failed to save partial response', { error: saveErr.message });
      }
    }

    sendEvent('error', { error: err.message, partial: responseText });
    res.end();
  }
});

router.post('/generate-tech', aiLimiter, clerkAuth, validate({
  description: { required: true, type: 'string', maxLength: 500 }
}), async (req, res) => {
  let responseText = '';
  try {
    const { description } = req.body;

    const systemPrompt = `You are a Technical Sourcing Specialist. Generate a production-grade technology module based on the user's specification.

OUTPUT_SPECIFICATION (JSON):
{
  "name": "TECH_NAME_UPPERCASE",
  "category": "mobile|frontend|backend|database|queue|auth|storage|external|devops",
  "description": "Professional 2-3 sentence technical overview of the technology's primary function and ecosystem position.",
  "products": [
    {
      "name": "Product or Cloud Service Name",
      "description": "High-fidelity description of why this product is a market leader",
      "url": "Valid documentation or marketing URL"
    }
  ],
  "icon": "Lucide icon name"
}

OPERATIONAL_RULES:
1. Name must be UPPERCASE (e.g., POSTGRESQL, DOCKER).
2. Category must be strictly: mobile, frontend, backend, database, queue, auth, storage, external, or devops.
3. Provide 2-3 high-quality product recommendations with valid URLs.
4. Maintain an industrial, precise, and professional tone.`;

    const { data: parsed, rawResponse } = await callOpenRouterForJSON({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate details for this technology: ${description}` }
      ],
      model: TECH_MODEL,
      schemaHint: '{"name":"TECH_NAME_UPPERCASE","category":"mobile|frontend|backend|database|queue|auth|storage|external|devops","description":"...","products":[{"name":"...","description":"...","url":"https://..."}],"icon":"lucide-icon-name"}'
    });
    responseText = rawResponse;

    const name = normalizeTechName(parsed.name || description);
    const normalizedCategory = String(parsed.category || '').trim().toLowerCase();
    const category = VALID_TECH_CATEGORIES.has(normalizedCategory)
      ? normalizedCategory
      : categorizeTech(name);

    res.json({
      name,
      category,
      description: parsed.description || getTechDescription(name),
      products: parsed.products || getCategoryProducts(category),
      icon: parsed.icon || 'tech'
    });
  } catch (err) {
    console.error('Error generating tech:', err);
    await recordAIFailure({
      kind: 'generate-tech',
      model: TECH_MODEL,
      inputPayload: req.body,
      rawResponse: responseText,
      errorMessage: err.message
    });
    res.status(500).json({ error: 'Failed to generate tech block: ' + err.message });
  }
});

router.post('/review-diagram', aiLimiter, clerkAuth, validate({
  question: { required: true, type: 'string', maxLength: 1200 },
  diagramName: { type: 'string', maxLength: 255 },
  nodes: { required: true, type: 'array' },
  edges: { required: true, type: 'array' },
  reviewFindings: { type: 'array' },
  messages: { type: 'array' }
}), async (req, res) => {
  let responseText = '';

  try {
    const {
      question,
      diagramName,
      nodes = [],
      edges = [],
      reviewFindings = [],
      messages = []
    } = req.body;

    const diagramContext = buildDiagramReviewContext({
      diagramName,
      nodes,
      edges,
      reviewFindings
    });

    // Guard: check serialized context size before sending to AI.
    // The context prompt already caps nodes (60) and edges (80), but
    // with a large built-in catalog and long labels this can still grow.
    // 28 000 chars leaves headroom for the system prompt + conversation history.
    const diagramContextJson = JSON.stringify(diagramContext, null, 2);
    if (diagramContextJson.length > 28_000) {
      return res.status(400).json({
        error: 'Diagram context is too large to review in a single pass. Simplify the diagram or reduce the number of nodes and connections, then try again.',
        contextCharacters: diagramContextJson.length
      });
    }

    const validNodeIds = new Set(diagramContext.nodes.map(node => node.id).filter(Boolean));
    const conversationMessages = Array.isArray(messages)
      ? messages
          .filter(message => message && ['user', 'assistant'].includes(message.role))
          .map(message => ({
            role: message.role,
            content: normalizeReviewText(message.content).slice(0, 1600)
          }))
          .filter(message => message.content)
          .slice(-8)
      : [];

    if (
      conversationMessages.length === 0 ||
      conversationMessages[conversationMessages.length - 1].role !== 'user' ||
      conversationMessages[conversationMessages.length - 1].content !== question
    ) {
      conversationMessages.push({ role: 'user', content: question });
    }

    const systemPrompt = `You are a Staff Infrastructure Architect and system-design tutor reviewing a diagram inside Archflow. Your reviews are precise, authoritative, educational, and production-grade. Output ONLY valid JSON.

RESPONSE SHAPE:
{
  "message": "Direct answer to the user's question. 1-3 sentences. Be specific and technical.",
  "suggestions": [
    {
      "name": "Technology name (e.g., REDIS, KAFKA, CLERK)",
      "category": "mobile|frontend|backend|database|queue|auth|storage|external|devops",
      "role": "What this component does (max 8 words)",
      "reason": "Why it is needed here (max 10 words)",
      "icon": "Server|Database|Shield|Cloud|MessageSquare|Smartphone|HardDrive",
      "products": [
        { "name": "Product name", "description": "Why this fits", "url": "https://..." }
      ],
      "connections": [
        {
          "source": "existing-node-id or ${REVIEW_NEW_NODE_TOKEN}",
          "target": "existing-node-id or ${REVIEW_NEW_NODE_TOKEN}",
          "label": "REST|SQL|OIDC|S3|KAFKA|gRPC|AMQP|GRAPHQL|WEBSOCKET",
          "reason": "Why this connection (max 10 words)"
        }
      ]
    }
  ]
}

APPROVED TECH CATALOG (suggest exact names from here):
mobile=SWIFT,KOTLIN,REACT_NATIVE,FLUTTER,EXPO,IONIC
frontend=NEXT.JS,REACT,VUE,SVELTE,ANGULAR,REMIX,ASTRO,NUXT
backend=EXPRESS,FASTAPI,NESTJS,DJANGO,SPRING_BOOT,GO,GRAPHQL,FLASK,GIN,RUST,NODE_JS,PYTHON,JAVA,SCALA,ERLANG,PHP,HONO,TRPC,LARAVEL,ASPNET_CORE
database=POSTGRESQL,MYSQL,MONGODB,REDIS,CASSANDRA,DYNAMODB,ELASTICSEARCH,COCKROACHDB,MEMCACHED,NEO4J,SQLITE,MARIADB,CLICKHOUSE,TIMESCALEDB,VITESS,BIGTABLE,AURORA,ROCKSDB,COUCHBASE,INFLUXDB
queue=KAFKA,RABBITMQ,SQS,BULLMQ,NATS,CELERY,PUB_SUB,ZEROMQ,REDPANDA
auth=CLERK,AUTH0,SUPABASE_AUTH,FIREBASE_AUTH,KEYCLOAK,OKTA,COGNITO,AZURE_AD
storage=S3,CLOUDFLARE_R2,GCS,MINIO,AZURE_BLOB,CEPH,BACKBLAZE,UPLOADTHING,SUPABASE_STORAGE
external=STRIPE,TWILIO,SENDGRID,ALGOLIA,MAPBOX,DATADOG,SENTRY,PAYPAL,PLAID,GOOGLE_MAPS,CLOUDFRONT,AKAMAI,HUBSPOT,RESEND,RECAPTCHA
devops=DOCKER,NGINX,CLOUDFLARE,KUBERNETES,PROMETHEUS,GRAFANA,TERRAFORM,VERCEL,GITHUB_ACTIONS,HELM,ISTIO,VAULT,ARGOCD,ELK,JAEGER,JENKINS,ENVOY,LINKERD,ZOOKEEPER,ETCD,RAILWAY,FLY_IO,AWS_EKS,GCP_GKE,AZURE_AKS,PULUMI,ANSIBLE,GITLAB_CI,CADENCE,TEMPORAL,NEW_RELIC,SENTRY

RULES:
1. Answer the question directly and technically in "message". Reference specific node names from the diagram.
2. Every suggestion MUST directly resolve a finding from the reviewFindings list in the diagram context. Do not suggest anything that does not fix a flagged finding.
3. Never suggest a duplicate of an existing node. Skip alternatives/replacements.
4. Every connection must reference exactly one ${REVIEW_NEW_NODE_TOKEN} and one real existing node id.
5. Use exact tech names from the approved catalog above. Never generic names.
6. For each suggestion, provide 1-2 meaningful connections with real protocols.
7. Map findings to suggestions using these patterns:
   - NO_AUTH_LAYER → suggest auth (CLERK, AUTH0, etc.)
   - NO_OBSERVABILITY_LAYER → suggest devops (PROMETHEUS+GRAFANA, DATADOG, etc.)
   - MISSING_CACHE_LAYER → suggest REDIS
   - MISSING_ASYNC_PROCESSING / LIMITED_ASYNC_SCALING → suggest queue (KAFKA, RABBITMQ, etc.)
   - NO_STORAGE_LAYER / MISSING_STORAGE_CONTROL_PLANE → suggest storage (S3, GCS, etc.)
   - MISSING_TRAFFIC_MANAGEMENT → suggest NGINX, CLOUDFLARE, or ENVOY
   - MISSING_APPLICATION_LAYER / MISSING_BACKEND_LAYER → suggest backend
   - SINGLE_DATASTORE_PRESSURE → suggest read-replica or cache (REDIS)
   - CENTRAL_BACKEND_CHOKE_POINT → suggest queue for async offload
   - FRONTEND_ONLY_ARCHITECTURE → suggest backend + database
8. Base your suggestions primarily on the reviewFindings and criticalSignals in the summary. If there are zero findings above info level, return empty suggestions with an explanation message.
9. If the user asks for explanation only, return empty suggestions array.
10. For learning or walkthrough questions, explain the architecture as a sequence of flows, responsibilities, tradeoffs, and failure modes. Avoid hype. Make it inspectable rather than magical.
11. Keep the answer useful for students: define why each important layer exists, but do not over-explain common acronyms unless the user asks.`;

    const { data: parsed, rawResponse } = await callOpenRouterForJSON({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Current diagram context:\n${JSON.stringify(diagramContext, null, 2)}\n\nUse only the listed node ids for any connection that references an existing node.`
        },
        ...conversationMessages
      ],
      model: DIAGRAM_REVIEW_MODEL,
      schemaHint: '{"message":"...","suggestions":[{"name":"...","category":"backend","role":"...","reason":"...","icon":"Server","products":[{"name":"...","description":"...","url":"https://..."}],"connections":[{"source":"existing-node-id-or-__NEW__","target":"existing-node-id-or-__NEW__","label":"REST","reason":"..."}]}]}'
    });
    responseText = rawResponse;

    const seenSuggestions = new Set();
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
          .map(suggestion => normalizeReviewSuggestion(suggestion, validNodeIds))
          .filter(Boolean)
          .filter(suggestion => {
            const key = `${suggestion.category}:${suggestion.name.toLowerCase()}`;

            if (seenSuggestions.has(key)) {
              return false;
            }

            seenSuggestions.add(key);
            return true;
          })
          .slice(0, 5)
      : [];

    let message = normalizeReviewText(
      parsed.message,
      'I reviewed the diagram and summarized the next architecture moves for you.'
    );

    if (suggestions.length > 0 && !/architectural review/i.test(message)) {
      message = `${message} I staged ${suggestions.length} proposed addition${suggestions.length === 1 ? '' : 's'} in the Architectural Review panel so you can accept or decline them there.`;
    }

    res.json({
      message,
      suggestions
    });
  } catch (err) {
    console.error('Error reviewing diagram:', err);
    await recordAIFailure({
      kind: 'review-diagram',
      model: DIAGRAM_REVIEW_MODEL,
      inputPayload: req.body,
      rawResponse: responseText,
      errorMessage: err.message
    });
    res.status(500).json({ error: 'Failed to review diagram: ' + err.message });
  }
});

router.post('/infer-connection', aiLimiter, optionalAuth, validate({
  source: { required: true, type: 'object' },
  target: { required: true, type: 'object' }
}), async (req, res) => {
  let responseText = '';
  try {
    const { source, target } = req.body;

    const systemPrompt = `You are a Network Protocol Engineer. Analyze the connection between two infrastructure components and identify the most technically accurate protocol.
    
    RESPONSE_FORMAT (JSON):
    { "label": "PROTOCOL_NAME" }
    
    PROTOCOL_SELECTION_GUIDE:
    - Frontend -> Backend: REST, GRAPHQL, WEBSOCKET, RPC.
    - Backend -> Database: SQL, REDIS, MONGO, ORM.
    - Backend -> Queue: AMQP, KAFKA, PUB/SUB.
    - Backend -> Auth: OIDC, JWT, SAML, API.
    - Backend -> Storage: S3, BLOB, BUCKET.
    - Backend -> Backend: gRPC, REST, TRPC.
    
    CONSTRAINTS:
    - Use technical, uppercase labels (e.g., gRPC, KAFKA, OIDC).
    - Max 2 words per label.
    - Output ONLY JSON.`;

    const userMessage = `Infer connection between:
    Source: ${source.name} (${source.category})
    Target: ${target.name} (${target.category})`;

    const { data: parsed, rawResponse } = await callOpenRouterForJSON({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      model: TECH_MODEL,
      schemaHint: '{"label":"PROTOCOL_NAME"}'
    });
    responseText = rawResponse;
    res.json({ label: normalizeProtocolLabel(parsed.label) });
  } catch (err) {
    console.error('Error inferring connection:', err);
    await recordAIFailure({
      kind: 'infer-connection',
      model: TECH_MODEL,
      inputPayload: req.body,
      rawResponse: responseText,
      errorMessage: err.message
    });
    res.json({ label: 'REST' }); // Fallback on error
  }
});

export default router;
