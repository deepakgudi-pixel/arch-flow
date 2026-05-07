import express from 'express';
import { clerkAuth, optionalAuth } from '../middleware/clerkAuth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

const FALLBACK_FREE_MODEL = process.env.OPENROUTER_FALLBACK_MODEL || 'openrouter/free';
const DIAGRAM_MODEL = process.env.OPENROUTER_DIAGRAM_MODEL || 'deepseek/deepseek-r1:free';
const TECH_MODEL = process.env.OPENROUTER_TECH_MODEL || 'deepseek/deepseek-r1:free';

async function sendOpenRouterRequest(messages, model) {
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7
    })
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${rawText}`);
  }

  const data = JSON.parse(rawText);
  return {
    content: data.choices[0].message.content,
    model: data.model || model
  };
}

function shouldFallbackToFreeRouter(error) {
  return (
    typeof error.message === 'string' &&
    error.message.includes('No endpoints found')
  );
}

async function callOpenRouter(messages, primaryModel) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY');
  }

  try {
    return await sendOpenRouterRequest(messages, primaryModel);
  } catch (error) {
    if (!shouldFallbackToFreeRouter(error) || primaryModel === FALLBACK_FREE_MODEL) {
      throw error;
    }

    console.warn(`OpenRouter model ${primaryModel} unavailable, retrying with ${FALLBACK_FREE_MODEL}`);
    return sendOpenRouterRequest(messages, FALLBACK_FREE_MODEL);
  }
}

const techDescriptions = {
  'PostgreSQL': 'A powerful, open source object-relational database system known for reliability and performance.',
  'MySQL': 'The world\'s most popular open source database, great for web applications.',
  'MongoDB': 'A flexible, scalable NoSQL database that stores data in JSON-like documents.',
  'Redis': 'An in-memory data structure store used as a database, cache, and message broker.',
  'Next.js': 'A React framework that enables features like server-side rendering and static site generation.',
  'Express': 'A minimal and flexible Node.js web application framework for building APIs.',
  'FastAPI': 'A modern Python framework for building APIs with automatic documentation.',
  'NestJS': 'A progressive Node.js framework for building efficient and scalable server-side applications.',
  'GraphQL': 'A query language for APIs that provides a complete description of data.',
  'Kafka': 'A distributed event streaming platform capable of handling trillions of events.',
  'RabbitMQ': 'An open-source message broker that implements the AMQP protocol.',
  'SQS': 'Amazon Simple Queue Service - a fully managed message queuing service.',
  'Clerk': 'Complete user management, authentication, and authorization for modern web apps.',
  'Auth0': 'A flexible, drop-in solution to add authentication and authorization to your apps.',
  'NextAuth': 'Authentication for Next.js applications with support for many providers.',
  'S3': 'Amazon Simple Storage Service - scalable object storage for any amount of data.',
  'Cloudflare R2': 'S3-compatible storage with zero egress fees.',
  'Stripe': 'The easiest way to accept payments online and in mobile apps.',
  'Twilio': 'Cloud communications platform for building SMS, voice, and messaging apps.',
  'SendGrid': 'A reliable email delivery service for transactional and marketing emails.',
  'Vercel': 'The platform for frontend developers to deploy instantly and scale.',
  'Docker': 'A platform for developing, shipping, and running applications in containers.',
  'Railway': 'A platform where you can provision infrastructure, deploy, and manage apps.',
  'Fly.io': 'A platform for running full-stack apps and databases close to users.',
  'Firebase Auth': 'Authentication service provided by Google for mobile and web apps.'
};

function getTechDescription(techName) {
  return techDescriptions[techName] || `A technology commonly used in modern web applications.`;
}

function getCategoryProducts(category) {
  const products = {
    database: [
      { name: 'Neon', description: 'Serverless Postgres with branching', url: 'https://neon.tech' },
      { name: 'Supabase', description: 'Open source Firebase alternative', url: 'https://supabase.com' },
      { name: 'PlanetScale', description: 'Serverless MySQL platform', url: 'https://planetscale.com' },
      { name: 'Railway', description: 'Full-stack hosting with DBs', url: 'https://railway.app' }
    ],
    frontend: [
      { name: 'Vercel', description: 'Best hosting for Next.js', url: 'https://vercel.com' },
      { name: 'Netlify', description: 'Static site hosting with features', url: 'https://netlify.com' },
      { name: 'Cloudflare Pages', description: 'Fast static hosting', url: 'https://pages.cloudflare.com' }
    ],
    auth: [
      { name: 'Clerk', description: 'Modern auth solution', url: 'https://clerk.com' },
      { name: 'Auth0', description: 'Enterprise auth platform', url: 'https://auth0.com' },
      { name: 'Supabase', description: 'Open source auth', url: 'https://supabase.com' }
    ],
    storage: [
      { name: 'Uploadthing', description: 'File uploads for Next.js', url: 'https://uploadthing.com' },
      { name: 'R2', description: 'S3 compatible, no egress fees', url: 'https://developers.cloudflare.com/r2' },
      { name: 'Backblaze', description: 'Cheap cloud storage', url: 'https://backblaze.com' }
    ],
    queue: [
      { name: 'Upstash', description: 'Redis-based serverless queues', url: 'https://upstash.com' },
      { name: 'Convoy', description: 'Event streaming infrastructure', url: 'https://getconvoy.io' }
    ]
  };

  return products[category] || [];
}

function categorizeTech(techName) {
  const name = techName.toLowerCase();

  if (name.includes('react') || name.includes('vue') || name.includes('next') || name.includes('angular') || name.includes('svelte') || name.includes('astro') || name.includes('nuxt') || name.includes('frontend') || name.includes('ui')) {
    return 'frontend';
  }
  if (name.includes('express') || name.includes('api') || name.includes('server') || name.includes('fastapi') || name.includes('nest') || name.includes('django') || name.includes('graphql') || name.includes('trpc')) {
    return 'backend';
  }
  if (name.includes('postgres') || name.includes('mysql') || name.includes('mongo') || name.includes('redis') || name.includes('dynamo') || name.includes('database') || name.includes('sql')) {
    return 'database';
  }
  if (name.includes('kafka') || name.includes('rabbit') || name.includes('queue') || name.includes('sqs') || name.includes('pubsub') || name.includes('message')) {
    return 'queue';
  }
  if (name.includes('auth') || name.includes('clerk') || name.includes('auth0') || name.includes('login') || name.includes('user')) {
    return 'auth';
  }
  if (name.includes('s3') || name.includes('storage') || name.includes('upload') || name.includes('file') || name.includes('r2')) {
    return 'storage';
  }
  if (name.includes('stripe') || name.includes('payment') || name.includes('twilio') || name.includes('email') || name.includes('send') || name.includes('algolia') || name.includes('map')) {
    return 'external';
  }
  if (name.includes('docker') || name.includes('vercel') || name.includes('railway') || name.includes('deploy') || name.includes('ci/cd') || name.includes('cloud') || name.includes('nginx')) {
    return 'devops';
  }

  return 'backend';
}

function generateNodesFromDiagram(nodes) {
  const categoryOrder = ['frontend', 'backend', 'database', 'queue', 'auth', 'storage', 'external', 'devops'];
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

  const categoryOrder = ['frontend', 'backend', 'database', 'queue', 'auth', 'storage', 'external', 'devops'];

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

router.post('/generate-diagram', optionalAuth, validate({
  description: { required: true, type: 'string', maxLength: 2000 },
  template: { type: 'string', maxLength: 50 }
}), async (req, res) => {
  try {
    const { description, template } = req.body;

    const systemPrompt = `You are a system design expert. Generate a system architecture diagram based on the user's description.

Return a JSON object with this exact structure:
{
  "nodes": [
    {
      "name": "TechName",
      "category": "frontend|backend|database|queue|auth|storage|external|devops",
      "role": "Short role description",
      "reason": "Why this tech was chosen"
    }
  ],
  "edges": [
    {
      "source": "TechName1",
      "target": "TechName2",
      "label": "REST|WebSocket|SQL|gRPC|API|Kafka"
    }
  ]
}

Rules:
- Category must be one of: frontend, backend, database, queue, auth, storage, external, devops
- Each node needs a clear role and reason
- Edges should show data flow with appropriate protocols
- Include at least one frontend, backend, and database for most apps
- Add queues for async processing, auth for user management, storage for files
- Keep it practical - 5-12 nodes for most apps

Example for a SaaS app:
{"nodes": [{"name": "Next.js", "category": "frontend", "role": "Web UI", "reason": "Best for SSR and developer experience"}, {"name": "Express", "category": "backend", "role": "API Server", "reason": "Flexible and widely used"}, {"name": "PostgreSQL", "category": "database", "role": "Primary DB", "reason": "Reliable relational storage"}], "edges": [{"source": "Next.js", "target": "Express", "label": "REST"}, {"source": "Express", "target": "PostgreSQL", "label": "SQL"}]}`;

    const userMessage = template
      ? `Create a system design for a ${template} application. ${description}`
      : description;

    const { content: responseText } = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      DIAGRAM_MODEL
    );

    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const positionedNodes = generateNodesFromDiagram(parsed.nodes || []);
    const edges = generateEdgesFromDiagram(
      parsed.nodes || [],
      parsed.edges || [],
      positionedNodes
    );

    res.json({
      nodes: positionedNodes,
      edges
    });
  } catch (err) {
    console.error('Error generating diagram:', err);
    res.status(500).json({ error: 'Failed to generate diagram: ' + err.message });
  }
});

router.post('/generate-tech', clerkAuth, validate({
  description: { required: true, type: 'string', maxLength: 500 }
}), async (req, res) => {
  try {
    const { description } = req.body;

    const systemPrompt = `You are a technology expert. Generate a detailed tech block based on the user's description.

Return a JSON object with this exact structure:
{
  "name": "TechName",
  "category": "frontend|backend|database|queue|auth|storage|external|devops",
  "description": "2-3 sentence description of what this technology does",
  "products": [
    {
      "name": "ProductName",
      "description": "Brief description of the product",
      "url": "https://example.com"
    }
  ],
  "icon": "tech"
}

Rules:
- Category must be one of: frontend, backend, database, queue, auth, storage, external, devops
- Include 1-3 relevant products with real URLs
- Description should be clear and helpful`;

    const { content: responseText } = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate details for this technology: ${description}` }
      ],
      TECH_MODEL
    );

    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

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

router.post('/infer-connection', optionalAuth, validate({
  source: { required: true, type: 'object' },
  target: { required: true, type: 'object' }
}), async (req, res) => {
  try {
    const { source, target } = req.body;

    const systemPrompt = `You are a system architecture expert. Identify the most appropriate connection protocol/label between two technologies.
    
    Return a JSON object with this exact structure:
    { "label": "PROTOCOL_NAME" }
    
    Rules:
    - Use common industry terms like: REST, SQL, gRPC, WebSocket, Pub/Sub, Kafka, API, Redis, SSH, AMQP, etc.
    - Keep it short (1-2 words, uppercase).
    - If unsure, use "REST" or "API".
    
    Example:
    Source: Next.js (frontend), Target: Express (backend) -> {"label": "REST"}
    Source: Express (backend), Target: PostgreSQL (database) -> {"label": "SQL"}
    Source: Socket.io (backend), Target: Redis (queue) -> {"label": "Pub/Sub"}`;

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

    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.json({ label: 'REST' });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ label: parsed.label || 'REST' });
  } catch (err) {
    console.error('Error inferring connection:', err);
    res.json({ label: 'REST' }); // Fallback on error
  }
});

export default router;
