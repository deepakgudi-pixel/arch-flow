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
import { callOpenRouterForJSON, DIAGRAM_MODEL, TECH_MODEL } from '../lib/openRouter.js';
import { buildDiagramUserMessage, generateDiagramFromPrompt } from '../lib/diagramGenerator.js';
import { recordAIFailure } from '../lib/aiFailures.js';

const router = express.Router();

import { RedisStore } from 'rate-limit-redis';

const VALID_TECH_CATEGORIES = new Set(['mobile', 'frontend', 'backend', 'database', 'queue', 'auth', 'storage', 'external', 'devops']);
const REVIEW_NEW_NODE_TOKEN = '__NEW__';
const DIAGRAM_REVIEW_MODEL = process.env.OPENROUTER_REVIEW_MODEL || TECH_MODEL;
const FALLBACK_ICON_BY_CATEGORY = {
  mobile: 'Smartphone',
  frontend: 'LayoutTemplate',
  backend: 'Server',
  database: 'Database',
  queue: 'MessageSquare',
  auth: 'ShieldCheck',
  storage: 'HardDrive',
  external: 'PlugZap',
  devops: 'CloudCog'
};

function normalizeTechName(name) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w.+/-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

function normalizeProtocolLabel(label) {
  const normalized = String(label || 'REST')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w.+/-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

  return normalized || 'REST';
}

function normalizeReviewText(value, fallback = '') {
  const normalized = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized || fallback;
}

function normalizeReviewIcon(icon, category) {
  const normalized = String(icon || '').trim();

  if (/^[A-Z][A-Za-z0-9]+$/.test(normalized)) {
    return normalized;
  }

  return FALLBACK_ICON_BY_CATEGORY[category] || 'Layers';
}

function normalizeReviewProduct(product, category) {
  if (!product || typeof product !== 'object' || Array.isArray(product)) {
    return null;
  }

  const name = normalizeReviewText(product.name);

  if (!name) {
    return null;
  }

  const url = String(product.url || '').trim();

  return {
    name,
    description: normalizeReviewText(
      product.description,
      `Recommended option for the ${category} layer in this architecture.`
    ),
    url: /^https?:\/\//i.test(url) ? url : 'https://example.com'
  };
}

function normalizeReviewConnection(connection, validNodeIds) {
  if (!connection || typeof connection !== 'object' || Array.isArray(connection)) {
    return null;
  }

  const source = String(connection.source || '').trim();
  const target = String(connection.target || '').trim();

  if (!source || !target || source === target) {
    return null;
  }

  const touchesNewNode = [source, target].filter(value => value === REVIEW_NEW_NODE_TOKEN).length === 1;

  if (!touchesNewNode) {
    return null;
  }

  const existingNodeId = source === REVIEW_NEW_NODE_TOKEN ? target : source;

  if (!validNodeIds.has(existingNodeId)) {
    return null;
  }

  return {
    source,
    target,
    label: normalizeProtocolLabel(connection.label),
    reason: normalizeReviewText(connection.reason)
  };
}

function normalizeReviewSuggestion(suggestion, validNodeIds) {
  if (!suggestion || typeof suggestion !== 'object' || Array.isArray(suggestion)) {
    return null;
  }

  const name = normalizeReviewText(suggestion.name);
  const normalizedCategory = String(suggestion.category || '').trim().toLowerCase();

  if (!name || !VALID_TECH_CATEGORIES.has(normalizedCategory)) {
    return null;
  }

  const products = Array.isArray(suggestion.products)
    ? suggestion.products
        .map(product => normalizeReviewProduct(product, normalizedCategory))
        .filter(Boolean)
        .slice(0, 3)
    : [];
  const connections = Array.isArray(suggestion.connections)
    ? suggestion.connections
        .map(connection => normalizeReviewConnection(connection, validNodeIds))
        .filter(Boolean)
        .slice(0, 6)
    : [];

  return {
    name,
    category: normalizedCategory,
    role: normalizeReviewText(
      suggestion.role,
      `${name} covers the ${normalizedCategory} layer for this system.`
    ),
    reason: normalizeReviewText(
      suggestion.reason,
      `${name} fills a missing responsibility in the current architecture.`
    ),
    icon: normalizeReviewIcon(suggestion.icon, normalizedCategory),
    products: products.length > 0 ? products : getCategoryProducts(normalizedCategory),
    connections
  };
}

function buildDiagramReviewSummary(nodes, edges, reviewFindings) {
  const categoryCounts = (nodes || []).reduce((acc, node) => {
    const category = String(node.category || 'unknown').trim().toLowerCase();
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const findingCounts = (reviewFindings || []).reduce((acc, finding) => {
    const severity = normalizeReviewText(finding.severity, 'warning').toLowerCase();
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  return {
    nodeCount: (nodes || []).length,
    edgeCount: (edges || []).length,
    categoryCounts,
    clientSurfaceCount: (categoryCounts.frontend || 0) + (categoryCounts.mobile || 0),
    backendServiceCount: categoryCounts.backend || 0,
    runtimeDependencyCount:
      (categoryCounts.database || 0)
      + (categoryCounts.queue || 0)
      + (categoryCounts.storage || 0)
      + (categoryCounts.external || 0)
      + (categoryCounts.auth || 0),
    findingCounts,
    criticalSignals: (reviewFindings || [])
      .filter(finding => normalizeReviewText(finding.severity, 'warning').toLowerCase() === 'critical')
      .map(finding => normalizeReviewText(finding.title, 'REVIEW_SIGNAL'))
      .slice(0, 6)
  };
}

function buildDiagramReviewContext({ diagramName, nodes, edges, reviewFindings }) {
  const normalizedNodes = (nodes || []).slice(0, 60).map(node => ({
    id: String(node.id || '').trim(),
    name: normalizeReviewText(node.name),
    category: String(node.category || 'backend').trim().toLowerCase(),
    role: normalizeReviewText(node.role)
  }));
  const normalizedEdges = (edges || []).slice(0, 80).map(edge => ({
    source: String(edge.source || '').trim(),
    target: String(edge.target || '').trim(),
    label: normalizeProtocolLabel(edge.label)
  }));
  const normalizedReviewFindings = (reviewFindings || []).slice(0, 20).map(finding => ({
    severity: normalizeReviewText(finding.severity, 'warning'),
    title: normalizeReviewText(finding.title, 'REVIEW_SIGNAL'),
    detail: normalizeReviewText(finding.detail)
  }));

  return {
    diagramName: normalizeReviewText(diagramName, 'Untitled diagram'),
    nodes: normalizedNodes,
    edges: normalizedEdges,
    reviewFindings: normalizedReviewFindings,
    summary: buildDiagramReviewSummary(normalizedNodes, normalizedEdges, normalizedReviewFindings),
    builtInCatalog: Object.fromEntries(
      Object.entries(builtInTech).map(([category, items]) => [
        category,
        items.slice(0, 8).map(item => item.name)
      ])
    ),
    connectionToken: REVIEW_NEW_NODE_TOKEN
  };
}

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: { error: 'Too many requests. Please slow down and synchronize with the mainframe later.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: (redis.isAvailable() && redis.getClient()) ? new RedisStore({
    sendCommand: (...args) => redis.getClient().sendCommand(args),
    prefix: 'rl:ai:',
  }) : undefined,
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

  const allBuiltInNames = Object.values(builtInTech)
    .flat()
    .map(t => t.name.toLowerCase());

  for (const node of nodes) {
    const nodeName = node.name.trim();
    if (!nodeName) continue;

    const lowerName = nodeName.toLowerCase();

    // Skip if built-in
    if (allBuiltInNames.includes(lowerName)) continue;

    try {
      const id = crypto.randomUUID();
      await pool.query(
        `INSERT INTO user_inventory (id, user_id, name, category, description, products, icon) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, name) DO NOTHING`,
        [
          id, 
          userId, 
          nodeName, 
          node.category || 'backend', 
          node.role || `Automated technical module for ${nodeName}`,
          JSON.stringify(node.products || []),
          node.icon || 'tech'
        ]
      );
    } catch (err) {
      console.error(`Failed to auto-register tech ${nodeName}:`, err);
    }
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
  const cacheKey = crypto.createHash('sha256').update(userMessage).digest('hex');
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
  try {
    const startAI = Date.now();
    const generatedDiagram = await generateDiagramFromPrompt({
      description,
      template,
      model: DIAGRAM_MODEL,
      onChunk: (chunk) => {
        responseText += chunk;
        sendEvent('chunk', { content: chunk });
      }
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
      edges: generatedDiagram.edges
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

    const systemPrompt = `You are Archflow's architecture copilot embedded inside an interactive diagram editor.

Return ONLY JSON in this shape:
{
  "message": "Short helpful answer to the user's question.",
  "suggestions": [
    {
      "name": "Technology or capability name with natural product casing",
      "category": "mobile|frontend|backend|database|queue|auth|storage|external|devops",
      "role": "One sentence describing the responsibility this addition would own",
      "reason": "Why it is missing or useful for this specific diagram",
      "icon": "PascalCase Lucide icon name such as Server or Database",
      "products": [
        {
          "name": "Product or managed service name",
          "description": "Why this option fits",
          "url": "https://..."
        }
      ],
      "connections": [
        {
          "source": "existing-node-id or ${REVIEW_NEW_NODE_TOKEN}",
          "target": "existing-node-id or ${REVIEW_NEW_NODE_TOKEN}",
          "label": "REST|SQL|OIDC|S3|KAFKA|...",
          "reason": "Why that edge should exist"
        }
      ]
    }
  ]
}

Rules:
1. Answer the user's question directly in "message".
2. Use "suggestions" only for genuinely missing technologies or architecture layers.
3. Keep suggestions specific to the diagram and the user's request. Prefer 0-4 suggestions, never more than 5.
4. Never suggest a duplicate of an existing node unless the user explicitly asks for an alternative. In this feature, skip alternatives and replacements.
5. Every suggested connection must reference exactly one ${REVIEW_NEW_NODE_TOKEN} token and one real existing node id from the diagram context.
6. Any technology you want the user to consider adding must appear in "suggestions" because suggestions are automatically staged into the Architectural Review panel.
7. When suggestions are present, tell the user in "message" that the suggestions were added to the Architectural Review panel and can be accepted or declined there.
8. For each suggestion, provide 1-3 meaningful connections when the surrounding architecture makes them inferable.
9. Treat diagramContext.reviewFindings and diagramContext.summary as authoritative reliability signals. Do not contradict them.
10. If the diagram context is incomplete or ambiguous, say that plainly instead of acting certain.
11. If critical or warning review findings exist, do not describe the architecture as complete or production-ready without naming the caveat.
12. If the user is asking for explanation only, you may return an empty suggestions array.`;

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
