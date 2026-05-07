import express from 'express';
import pool from '../db/pool.js';
import { clerkAuth, optionalAuth } from '../middleware/clerkAuth.js';
import { ensureUserExists } from '../services/userSync.js';

const router = express.Router();

function generateId() {
  return 'inv_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

const builtInTech = {
  frontend: [
    { name: 'Next.js', category: 'frontend', description: 'React framework with SSR and API routes', icon: 'react', products: [] },
    { name: 'React', category: 'frontend', description: 'JavaScript library for building UIs', icon: 'react', products: [] },
    { name: 'Vue', category: 'frontend', description: 'Progressive JavaScript framework', icon: 'vue', products: [] },
    { name: 'Svelte', category: 'frontend', description: 'Cybernetically enhanced web apps', icon: 'svelte', products: [] },
    { name: 'Nuxt', category: 'frontend', description: 'Vue.js framework with SSR', icon: 'nuxt', products: [] },
    { name: 'Astro', category: 'frontend', description: 'Static site builder with islands', icon: 'astro', products: [] },
    { name: 'Angular', category: 'frontend', description: 'Platform for building mobile/desktop web apps', icon: 'angular', products: [] }
  ],
  backend: [
    { name: 'Express', category: 'backend', description: 'Fast Node.js web framework', icon: 'server', products: [] },
    { name: 'FastAPI', category: 'backend', description: 'Modern Python web framework', icon: 'server', products: [] },
    { name: 'NestJS', category: 'backend', description: 'Scalable Node.js framework', icon: 'server', products: [] },
    { name: 'GraphQL', category: 'backend', description: 'Query language for APIs', icon: 'graphql', products: [] },
    { name: 'tRPC', category: 'backend', description: 'Type-safe APIs without schemas', icon: 'server', products: [] },
    { name: 'Hono', category: 'backend', description: 'Fast web framework for Edge', icon: 'server', products: [] },
    { name: 'Django', category: 'backend', description: 'High-level Python web framework', icon: 'django', products: [] }
  ],
  database: [
    { name: 'PostgreSQL', category: 'database', description: 'Advanced open source relational database', icon: 'database', products: [] },
    { name: 'MySQL', category: 'database', description: 'Popular open source database', icon: 'database', products: [] },
    { name: 'MongoDB', category: 'database', description: 'NoSQL document database', icon: 'database', products: [] },
    { name: 'Redis', category: 'database', description: 'In-memory data store and cache', icon: 'database', products: [] },
    { name: 'SQLite', category: 'database', description: 'Lightweight embedded database', icon: 'database', products: [] },
    { name: 'DynamoDB', category: 'database', description: 'AWS NoSQL database', icon: 'database', products: [] },
    { name: 'Cassandra', category: 'database', description: 'Distributed NoSQL database', icon: 'database', products: [] }
  ],
  queue: [
    { name: 'Kafka', category: 'queue', description: 'Distributed event streaming platform', icon: 'message', products: [] },
    { name: 'RabbitMQ', category: 'queue', description: 'Message broker', icon: 'message', products: [] },
    { name: 'SQS', category: 'queue', description: 'AWS message queue service', icon: 'message', products: [] },
    { name: 'BullMQ', category: 'queue', description: 'Redis-based queue for Node.js', icon: 'message', products: [] },
    { name: 'Pub/Sub', category: 'queue', description: 'Google Cloud pub/sub service', icon: 'message', products: [] }
  ],
  auth: [
    { name: 'Clerk', category: 'auth', description: 'User authentication and management', icon: 'shield', products: [] },
    { name: 'Auth0', category: 'auth', description: 'Identity and access management', icon: 'shield', products: [] },
    { name: 'NextAuth', category: 'auth', description: 'Authentication for Next.js', icon: 'shield', products: [] },
    { name: 'Supabase Auth', category: 'auth', description: 'Auth built into Supabase', icon: 'shield', products: [] },
    { name: 'Firebase Auth', category: 'auth', description: 'Google Firebase authentication', icon: 'shield', products: [] }
  ],
  storage: [
    { name: 'S3', category: 'storage', description: 'AWS object storage service', icon: 'storage', products: [] },
    { name: 'Cloudflare R2', category: 'storage', description: 'S3-compatible object storage', icon: 'storage', products: [] },
    { name: 'Supabase Storage', category: 'storage', description: 'File storage built on S3', icon: 'storage', products: [] },
    { name: 'Uploadthing', category: 'storage', description: 'File upload solution for Next.js', icon: 'storage', products: [] }
  ],
  external: [
    { name: 'Stripe', category: 'external', description: 'Payment processing platform', icon: 'credit-card', products: [] },
    { name: 'Twilio', category: 'external', description: 'Communication APIs for SMS/voice', icon: 'phone', products: [] },
    { name: 'SendGrid', category: 'external', description: 'Email delivery service', icon: 'mail', products: [] },
    { name: 'Resend', category: 'external', description: 'Modern email API', icon: 'mail', products: [] },
    { name: 'Algolia', category: 'external', description: 'Search and discovery platform', icon: 'search', products: [] },
    { name: 'Mapbox', category: 'external', description: 'Maps and location services', icon: 'map', products: [] }
  ],
  devops: [
    { name: 'Docker', category: 'devops', description: 'Container platform', icon: 'container', products: [] },
    { name: 'Vercel', category: 'devops', description: 'Frontend cloud platform', icon: 'cloud', products: [] },
    { name: 'Railway', category: 'devops', description: 'Deploy anything, anywhere', icon: 'cloud', products: [] },
    { name: 'Fly.io', category: 'devops', description: 'Distributed app platform', icon: 'cloud', products: [] },
    { name: 'Nginx', category: 'devops', description: 'Web server and reverse proxy', icon: 'server', products: [] },
    { name: 'Cloudflare', category: 'devops', description: 'CDN and security platform', icon: 'cloud', products: [] },
    { name: 'GitHub Actions', category: 'devops', description: 'CI/CD automation platform', icon: 'git', products: [] }
  ]
};

router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = {
      builtIn: builtInTech,
      custom: []
    };

    if (req.user) {
      const customResult = await pool.query(
        'SELECT * FROM user_inventory WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );

      result.custom = customResult.rows.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        products: item.products,
        icon: item.icon
      }));
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

router.post('/', clerkAuth, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { name, category, description, products, icon } = req.body;

    await ensureUserExists(req.user);

    const id = generateId();

    await pool.query(
      'INSERT INTO user_inventory (id, user_id, name, category, description, products, icon) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, userId, name, category, description, JSON.stringify(products || []), icon || 'tech']
    );

    res.json({ id, name, category, description, products, icon });
  } catch (err) {
    console.error('Error adding to inventory:', err);
    res.status(500).json({ error: 'Failed to add to inventory' });
  }
});

router.delete('/:id', clerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const existing = await pool.query(
      'SELECT id FROM user_inventory WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await pool.query('DELETE FROM user_inventory WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting from inventory:', err);
    res.status(500).json({ error: 'Failed to delete from inventory' });
  }
});

export default router;
