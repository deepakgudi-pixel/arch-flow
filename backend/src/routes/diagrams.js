import express from 'express';
import pool from '../db/pool.js';
import { clerkAuth, optionalAuth } from '../middleware/clerkAuth.js';
import { ensureUserExists } from '../services/userSync.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

function generateId() {
  return 'd_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

router.get('/', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT d.id, d.name, d.nodes, d.edges, d.created_at, d.updated_at, 
              (d.user_id = $1) as is_owner
       FROM diagrams d
       LEFT JOIN diagram_collaborators dc ON d.id = dc.diagram_id
       WHERE d.user_id = $1 OR dc.user_id = $1
       GROUP BY d.id
       ORDER BY d.updated_at DESC`,
      [userId]
    );

    res.json({
      diagrams: result.rows.map(d => ({
        id: d.id,
        name: d.name,
        nodeCount: d.nodes.length,
        edgeCount: d.edges.length,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        isOwner: d.is_owner
      })),
      stats: {
        totalNodes: result.rows.reduce((sum, d) => sum + d.nodes.length, 0),
        totalEdges: result.rows.reduce((sum, d) => sum + d.edges.length, 0),
        topTech: Object.entries(result.rows.reduce((acc, d) => {
          d.nodes.forEach(n => {
            acc[n.name] = (acc[n.name] || 0) + 1;
          });
          return acc;
        }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5)
      }
    });
  } catch (err) {
    console.error('Error fetching diagrams:', err);
    res.status(500).json({ error: 'Failed to fetch diagrams' });
  }
});

router.post('/', clerkAuth, validate({
  name: { type: 'string', maxLength: 200 },
  template: { type: 'string', enum: ['blank', 'saas', 'ecommerce', 'mobile', 'realtime', 'microservices'] }
}), async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { name, template } = req.body;

    await ensureUserExists(req.user);

    const id = generateId();
    let nodes = [];
    let edges = [];

    const templates = {
      'saas': {
        nodes: [
          { id: 'n1', name: 'Next.js', category: 'frontend', role: 'Web frontend', icon: 'react' },
          { id: 'n2', name: 'Clerk', category: 'auth', role: 'Authentication', icon: 'shield' },
          { id: 'n3', name: 'Express', category: 'backend', role: 'API server', icon: 'server' },
          { id: 'n4', name: 'PostgreSQL', category: 'database', role: 'Primary database', icon: 'database' },
          { id: 'n5', name: 'Redis', category: 'database', role: 'Cache layer', icon: 'database' },
          { id: 'n6', name: 'S3', category: 'storage', role: 'File storage', icon: 'storage' }
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n3', label: 'REST' },
          { id: 'e2', source: 'n3', target: 'n4', label: 'SQL' },
          { id: 'e3', source: 'n3', target: 'n5', label: 'Redis' },
          { id: 'e4', source: 'n3', target: 'n6', label: 'API' }
        ]
      },
      'ecommerce': {
        nodes: [
          { id: 'n1', name: 'Next.js', category: 'frontend', role: 'Web frontend', icon: 'react' },
          { id: 'n2', name: 'Express', category: 'backend', role: 'API server', icon: 'server' },
          { id: 'n3', name: 'PostgreSQL', category: 'database', role: 'Primary database', icon: 'database' },
          { id: 'n4', name: 'Redis', category: 'database', role: 'Cache layer', icon: 'database' },
          { id: 'n5', name: 'Stripe', category: 'external', role: 'Payments', icon: 'credit-card' },
          { id: 'n6', name: 'S3', category: 'storage', role: 'Product images', icon: 'storage' }
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2', label: 'REST' },
          { id: 'e2', source: 'n2', target: 'n3', label: 'SQL' },
          { id: 'e3', source: 'n2', target: 'n5', label: 'API' },
          { id: 'e4', source: 'n2', target: 'n6', label: 'API' }
        ]
      },
      'mobile': {
        nodes: [
          { id: 'n1', name: 'FastAPI', category: 'backend', role: 'API server', icon: 'server' },
          { id: 'n2', name: 'PostgreSQL', category: 'database', role: 'Primary database', icon: 'database' },
          { id: 'n3', name: 'Redis', category: 'database', role: 'Cache layer', icon: 'database' },
          { id: 'n4', name: 'S3', category: 'storage', role: 'Media storage', icon: 'storage' },
          { id: 'n5', name: 'Firebase Auth', category: 'auth', role: 'Authentication', icon: 'shield' }
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2', label: 'SQL' },
          { id: 'e2', source: 'n1', target: 'n3', label: 'Redis' },
          { id: 'e3', source: 'n1', target: 'n4', label: 'API' }
        ]
      },
      'realtime': {
        nodes: [
          { id: 'n1', name: 'Next.js', category: 'frontend', role: 'Web frontend', icon: 'react' },
          { id: 'n2', name: 'Express', category: 'backend', role: 'API server', icon: 'server' },
          { id: 'n3', name: 'PostgreSQL', category: 'database', role: 'Primary database', icon: 'database' },
          { id: 'n4', name: 'Redis', category: 'database', role: 'Real-time pub/sub', icon: 'database' },
          { id: 'n5', name: 'Socket.io', category: 'backend', role: 'WebSocket server', icon: 'server' }
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2', label: 'REST' },
          { id: 'e2', source: 'n1', target: 'n5', label: 'WebSocket' },
          { id: 'e3', source: 'n2', target: 'n3', label: 'SQL' },
          { id: 'e4', source: 'n5', target: 'n4', label: 'Pub/Sub' }
        ]
      },
      'microservices': {
        nodes: [
          { id: 'n1', name: 'Next.js', category: 'frontend', role: 'Web frontend', icon: 'react' },
          { id: 'n2', name: 'API Gateway', category: 'backend', role: 'Gateway', icon: 'server' },
          { id: 'n3', name: 'Service A', category: 'backend', role: 'User service', icon: 'server' },
          { id: 'n4', name: 'Service B', category: 'backend', role: 'Order service', icon: 'server' },
          { id: 'n5', name: 'Service C', category: 'backend', role: 'Payment service', icon: 'server' },
          { id: 'n6', name: 'PostgreSQL', category: 'database', role: 'Primary database', icon: 'database' },
          { id: 'n7', name: 'Kafka', category: 'queue', role: 'Message queue', icon: 'message' }
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2', label: 'REST' },
          { id: 'e2', source: 'n2', target: 'n3', label: 'gRPC' },
          { id: 'e3', source: 'n2', target: 'n4', label: 'gRPC' },
          { id: 'e4', source: 'n2', target: 'n5', label: 'gRPC' },
          { id: 'e5', source: 'n3', target: 'n6', label: 'SQL' },
          { id: 'e6', source: 'n4', target: 'n7', label: 'Kafka' },
          { id: 'e7', source: 'n5', target: 'n7', label: 'Kafka' }
        ]
      }
    };

    if (template && templates[template]) {
      nodes = templates[template].nodes;
      edges = templates[template].edges;
    }

    await pool.query(
      'INSERT INTO diagrams (id, user_id, name, nodes, edges) VALUES ($1, $2, $3, $4, $5)',
      [id, userId, name || 'Untitled diagram', JSON.stringify(nodes), JSON.stringify(edges)]
    );

    res.json({ id, name: name || 'Untitled diagram', nodes, edges });
  } catch (err) {
    console.error('Error creating diagram:', err);
    res.status(500).json({ error: 'Failed to create diagram' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await pool.query(
      `SELECT d.*, 
              (d.user_id = $2) as is_owner,
              EXISTS(SELECT 1 FROM diagram_collaborators WHERE diagram_id = d.id AND user_id = $2) as is_collaborator
       FROM diagrams d WHERE d.id = $1`,
      [id, userId || 'anonymous']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diagram not found' });
    }

    const diagram = result.rows[0];

    // If diagram exists but user is not owner/collaborator, denied
    if (!diagram.is_owner && !diagram.is_collaborator) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(diagram);
  } catch (err) {
    console.error('Error fetching diagram:', err);
    res.status(500).json({ error: 'Failed to fetch diagram' });
  }
});

router.put('/:id', clerkAuth, validate({
  name: { type: 'string', maxLength: 200 },
  nodes: { type: 'array' },
  edges: { type: 'array' }
}), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nodes, edges } = req.body;
    const { id: userId } = req.user;

    const existing = await pool.query(
      `SELECT user_id FROM diagrams d 
       WHERE d.id = $1 AND (d.user_id = $2 OR EXISTS(SELECT 1 FROM diagram_collaborators WHERE diagram_id = $1 AND user_id = $2))`,
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await pool.query(
      'UPDATE diagrams SET name = COALESCE($1, name), nodes = COALESCE($2, nodes), edges = COALESCE($3, edges), updated_at = NOW() WHERE id = $4',
      [name, nodes ? JSON.stringify(nodes) : null, edges ? JSON.stringify(edges) : null, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating diagram:', err);
    res.status(500).json({ error: 'Failed to update diagram' });
  }
});

router.delete('/:id', clerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const existing = await pool.query(
      'SELECT id FROM diagrams WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Diagram not found' });
    }

    await pool.query('DELETE FROM diagrams WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting diagram:', err);
    res.status(500).json({ error: 'Failed to delete diagram' });
  }
});

// Generate/Get Invite Code
router.post('/:id/invite', clerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    // Only owner can manage invites
    const result = await pool.query('SELECT invite_code FROM diagrams WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rows.length === 0) return res.status(403).json({ error: 'Only owner can manage invites' });

    let code = result.rows[0].invite_code;
    if (!code) {
      code = Math.random().toString(36).substring(2, 10).toUpperCase();
      await pool.query('UPDATE diagrams SET invite_code = $1 WHERE id = $2', [code, id]);
    }

    res.json({ inviteCode: code });
  } catch (err) {
    res.status(500).json({ error: 'Failed to manage invite' });
  }
});

// Join via Invite Code
router.post('/join/:code', clerkAuth, async (req, res) => {
  try {
    const { code } = req.params;
    const { id: userId } = req.user;

    await ensureUserExists(req.user);

    const result = await pool.query('SELECT id, user_id FROM diagrams WHERE invite_code = $1', [code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Invalid invite code' });

    const diagram = result.rows[0];
    if (diagram.user_id === userId) return res.json({ id: diagram.id, message: 'Owner already' });

    await pool.query(
      'INSERT INTO diagram_collaborators (diagram_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [diagram.id, userId]
    );

    res.json({ id: diagram.id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join diagram' });
  }
});

// List Collaborators
router.get('/:id/collaborators', clerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    // Check if owner
    const check = await pool.query('SELECT id FROM diagrams WHERE id = $1 AND user_id = $2', [id, userId]);
    if (check.rows.length === 0) return res.status(403).json({ error: 'Only owner can see collaborator list' });

    const result = await pool.query(
      `SELECT u.id, u.email, dc.joined_at 
       FROM diagram_collaborators dc
       JOIN users u ON dc.user_id = u.id
       WHERE dc.diagram_id = $1`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch collaborators' });
  }
});

// Remove Collaborator
router.delete('/:id/collaborators/:targetUserId', clerkAuth, async (req, res) => {
  try {
    const { id, targetUserId } = req.params;
    const { id: userId } = req.user;

    // Only owner can remove
    const check = await pool.query('SELECT id FROM diagrams WHERE id = $1 AND user_id = $2', [id, userId]);
    if (check.rows.length === 0) return res.status(403).json({ error: 'Only owner can remove collaborators' });

    await pool.query('DELETE FROM diagram_collaborators WHERE diagram_id = $1 AND user_id = $2', [id, targetUserId]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

export default router;
