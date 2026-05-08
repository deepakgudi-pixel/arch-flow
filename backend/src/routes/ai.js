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
  categoryOrder, 
  getTechDescription, 
  getCategoryProducts,
  categorizeTech
} from '../lib/tech.js';

const router = express.Router();

import { RedisStore } from 'rate-limit-redis';

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

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

const FALLBACK_FREE_MODEL = process.env.OPENROUTER_FALLBACK_MODEL || 'openrouter/free';
const DIAGRAM_MODEL = process.env.OPENROUTER_DIAGRAM_MODEL || 'openrouter/auto';
const TECH_MODEL = process.env.OPENROUTER_TECH_MODEL || 'openrouter/auto';

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

async function sendOpenRouterRequest(messages, model, signal, onChunk) {
  const isStreaming = !!onChunk;
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://archflow.app',
      'X-Title': 'Archflow'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      stream: isStreaming
    }),
    signal
  });

  if (!response.ok) {
    const rawText = await response.text();
    throw new Error(`OpenRouter error: ${rawText}`);
  }

  if (isStreaming) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              onChunk(content);
            }
          } catch (e) {
            console.error('Error parsing stream chunk:', e);
          }
        }
      }
    }
    return { content: fullContent, model };
  } else {
    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model || model
    };
  }
}

function shouldFallbackToFreeRouter(error) {
  return (
    error.name === 'AbortError' ||
    (typeof error.message === 'string' &&
      (error.message.includes('No endpoints found') || 
       error.message.includes('timeout') ||
       error.message.includes('504') ||
       error.message.includes('429')))
  );
}

async function callOpenRouter(messages, primaryModel, onChunk) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for stream

  try {
    return await sendOpenRouterRequest(messages, primaryModel, controller.signal, onChunk);
  } catch (error) {
    if (!shouldFallbackToFreeRouter(error) || primaryModel === FALLBACK_FREE_MODEL) {
      throw error;
    }

    console.warn(`OpenRouter model ${primaryModel} failed/timeout, retrying with ${FALLBACK_FREE_MODEL}`);
    const fallbackController = new AbortController();
    const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 45000);
    
    try {
      return await sendOpenRouterRequest(messages, FALLBACK_FREE_MODEL, fallbackController.signal, onChunk);
    } finally {
      clearTimeout(fallbackTimeoutId);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

function robustParseJSON(text) {
  try {
    // Remove markdown code fences if present
    const clean = text.replace(/```json|```/g, '').trim();
    // Find the first { and last } to isolate the JSON object
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
      throw new Error('No JSON object found in response');
    }
    
    return JSON.parse(clean.substring(start, end + 1));
  } catch (err) {
    console.error('JSON Parse Error. Raw text:', text);
    throw new Error('Failed to parse AI response: ' + err.message);
  }
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

function generateNodesFromDiagram(nodes) {
  const categoryColumns = {};
  const columnWidth = 300;
  const nodeHeight = 80;
  const startX = 100;
  const startY = 100;

  categoryOrder.forEach((cat, idx) => {
    categoryColumns[cat] = startX + (idx * columnWidth);
  });

  const nodesByCategory = {};
  nodes.forEach(node => {
    const cat = node.category || 'backend';
    if (!nodesByCategory[cat]) nodesByCategory[cat] = [];
    nodesByCategory[cat].push(node);
  });

  let idCounter = 1;
  const positionedNodes = [];

  categoryOrder.forEach(cat => {
    const catNodes = nodesByCategory[cat] || [];
    const x = categoryColumns[cat];

    catNodes.forEach((node, idx) => {
      positionedNodes.push({
        id: `n${idCounter++}`,
        name: node.name,
        category: cat,
        role: node.role || `Handles ${node.name.toLowerCase()} operations`,
        reason: node.reason || `Selected for its strength in handling ${cat} requirements`,
        icon: node.icon || 'tech',
        position: {
          x: x,
          y: startY + (idx * nodeHeight)
        },
        products: getCategoryProducts(cat)
      });
    });
  });

  return positionedNodes;
}

function generateEdgesFromDiagram(nodes, edges, positionedNodes) {
  const nodeNameToId = {};
  positionedNodes.forEach(node => {
    nodeNameToId[node.name.toLowerCase()] = node.id;
  });

  return edges.map((edge, idx) => {
    const sourceId = nodeNameToId[edge.source.toLowerCase()] || `n${idx + 1}`;
    const targetId = nodeNameToId[edge.target.toLowerCase()] || `n${idx + 2}`;

    return {
      id: `e${idx + 1}`,
      source: sourceId,
      target: targetId,
      label: edge.label || 'Connection',
      type: 'step'
    };
  });
}

router.post('/generate-diagram', aiLimiter, optionalAuth, validate({
  description: { required: true, type: 'string', maxLength: 2000 },
  template: { type: 'string', maxLength: 50 },
  diagramId: { type: 'string', maxLength: 50 }
}), async (req, res) => {
  const { description, template, diagramId } = req.body;

  const userMessage = template
    ? `Create a system design for a ${template} application. ${description}`
    : description;

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

  const systemPrompt = `You are a Senior Principal Infrastructure Architect. Your mandate is to design technically accurate, production-grade systems. Accuracy is paramount; do not include irrelevant or vague components.

PRECISION_MANDATE:
- RELEVANCE: Only include components that are strictly necessary for the architecture.
- SPECIFICITY: Use real-world, industry-standard technology names (e.g., KAFKA instead of GENERIC_QUEUE).
- PLATFORM_INTEGRITY: Distinguish clearly between Mobile and Web. If the user specifies 'Mobile', use mobile-native tech (e.g., SWIFT, KOTLIN, REACT_NATIVE). If 'Web', use web tech (e.g., NEXT.JS, REACT). Do not blend them unless a cross-platform or multi-client system is requested.

ARCHITECTURAL_RIGOR:
- SECURITY_FIRST: Always consider if a system needs an AUTH gateway, Firewall, or Secret Management (e.g., VAULT).
- DATA_FLOW_STRICTNESS: Labels on connections should describe the ACTION or PATTERN (e.g., EVENT_PUBLISH, SYNC_FETCH, BATCH_WRITE) when appropriate.
- OBSERVABILITY: For non-trivial systems, include logging and monitoring components (e.g., GRAFANA, DATADOG, ELK) in the 'devops' category.

JSON_STRUCTURE_SPECIFICATION:
{
  "nodes": [
    {
      "name": "TECH_NAME_UPPERCASE",
      "category": "mobile|frontend|backend|database|queue|auth|storage|external|devops",
      "role": "Specific technical function (e.g., INVENTORY_CACHE)",
      "reason": "Technical justification based on the user's specific requirements",
      "icon": "Lucide icon name (e.g., database, server, shield, smartphone, message-square, storage)"
    }
  ],
  "edges": [
    {
      "source": "TECH_NAME_UPPERCASE",
      "target": "TECH_NAME_UPPERCASE",
      "label": "EXACT_PROTOCOL (e.g., gRPC, AMQP, SQL, OIDC)"
    }
  ]
}

STRICT_CONSTRAINTS:
1. Names must be uppercase and technically precise (e.g., NODEJS_API, POSTGRESQL_DB).
2. Category must be strictly: mobile, frontend, backend, database, queue, auth, storage, external, devops.
3. **FRONTENDS MUST NEVER CONNECT DIRECTLY TO DATABASES.** Always place a Backend/API layer in between for security and business logic.
4. Edges must represent actual data dependencies.
5. Output ONLY the JSON object.

ARCH_PATTERN_ADVICE:
- **Standard 3-Tier**: For web/mobile apps, always default to a Frontend/Mobile -> Backend -> Database flow.
- Focused: Ensure the technology choice matches the scale implied by the prompt.`;

  let responseText = '';
  try {
    const startAI = Date.now();
    const openRouterResult = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      DIAGRAM_MODEL,
      (chunk) => {
        responseText += chunk;
        sendEvent('chunk', { content: chunk });
      }
    );
    // Use the full content from result if stream was incomplete but somehow finished
    responseText = openRouterResult.content;
    const duration = Date.now() - startAI;

    logger.aiInteraction({
      model: DIAGRAM_MODEL,
      prompt_hash: cacheKey,
      duration_ms: duration,
      status: 'SUCCESS',
      is_cached: false
    });

    const parsed = robustParseJSON(responseText);

    const positionedNodes = generateNodesFromDiagram(parsed.nodes || []);
    const edges = generateEdgesFromDiagram(
      parsed.nodes || [],
      parsed.edges || [],
      positionedNodes
    );

    const result = {
      nodes: positionedNodes,
      edges
    };

    // Auto-register new tech to community inventory if user is logged in
    if (req.user) {
      try {
        await autoRegisterTech(req.user, positionedNodes);
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
          JSON.stringify(positionedNodes),
          JSON.stringify(edges),
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

    const { content: responseText } = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate details for this technology: ${description}` }
      ],
      TECH_MODEL
    );

    const parsed = robustParseJSON(responseText);

    const category = parsed.category || categorizeTech(parsed.name);

    res.json({
      name: parsed.name,
      category,
      description: parsed.description || getTechDescription(parsed.name),
      products: parsed.products || getCategoryProducts(category),
      icon: parsed.icon || 'tech'
    });
  } catch (err) {
    console.error('Error generating tech:', err);
    res.status(500).json({ error: 'Failed to generate tech block: ' + err.message });
  }
});

router.post('/infer-connection', aiLimiter, optionalAuth, validate({
  source: { required: true, type: 'object' },
  target: { required: true, type: 'object' }
}), async (req, res) => {
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

    const { content: responseText } = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      TECH_MODEL
    );

    const parsed = robustParseJSON(responseText);
    res.json({ label: parsed.label || 'REST' });
  } catch (err) {
    console.error('Error inferring connection:', err);
    res.json({ label: 'REST' }); // Fallback on error
  }
});

export default router;
