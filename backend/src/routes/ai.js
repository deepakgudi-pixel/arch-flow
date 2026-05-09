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
