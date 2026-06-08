import express from 'express';
import pool from '../db/pool.js';
import { clerkAuth, optionalAuth } from '../middleware/clerkAuth.js';
import { ensureUserExists } from '../services/userSync.js';
import { validate } from '../middleware/validate.js';
import { logger } from '../lib/logger.js';
import { getStarterTemplate } from '../lib/starterTemplates.js';
import {
  buildInviteCode,
  deleteDiagramHandler,
  listDiagramVersionsHandler,
  updateDiagramHandler
} from './diagramRouteHandlers.js';

const router = express.Router();

import crypto from 'crypto';

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
    logger.error('Error fetching diagrams', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch diagrams' });
  }
});

router.post('/', clerkAuth, validate({
  name: { type: 'string', maxLength: 200 },
  template: { type: 'string', enum: ['blank', 'saas', 'ecommerce', 'mobile', 'realtime', 'microservices'] }
}), async (req, res) => {
  try {
    const { id: userId } = req.user;
    const id = 'd_' + crypto.randomUUID().split('-')[0];
    const { name, template } = req.body;

    await ensureUserExists(req.user);

    const { nodes, edges } = getStarterTemplate(template);

    await pool.query(
      'INSERT INTO diagrams (id, user_id, name, nodes, edges) VALUES ($1, $2, $3, $4, $5)',
      [id, userId, name || 'Untitled diagram', JSON.stringify(nodes), JSON.stringify(edges)]
    );

    res.json({ id, name: name || 'Untitled diagram', nodes, edges });
  } catch (err) {
    logger.error('Error creating diagram', { error: err.message });
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
    logger.error('Error fetching diagram', { error: err.message, id: req.params.id });
    res.status(500).json({ error: 'Failed to fetch diagram' });
  }
});

router.put('/:id', clerkAuth, validate({
  name: { type: 'string', maxLength: 200 },
  nodes: { type: 'array' },
  edges: { type: 'array' },
  recordVersion: { type: 'boolean' }
}), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nodes, edges, recordVersion = false } = req.body;
    const { id: userId } = req.user;

    const result = await updateDiagramHandler({
      db: pool,
      diagramId: id,
      userId,
      name,
      nodes,
      edges,
      recordVersion
    });

    res.status(result.status).json(result.body);
  } catch (err) {
    logger.error('Error updating diagram', { error: err.message });
    res.status(500).json({ error: 'Failed to update diagram' });
  }
});

router.get('/:id/versions', clerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const result = await listDiagramVersionsHandler({ db: pool, diagramId: id, userId });
    res.status(result.status).json(result.body);
  } catch (err) {
    logger.error('Error fetching diagram versions', { error: err.message, id });
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

router.delete('/:id/versions', clerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const check = await pool.query('SELECT id FROM diagrams WHERE id = $1 AND user_id = $2', [id, userId]);
    if (check.rows.length === 0) return res.status(403).json({ error: 'Permission denied' });

    await pool.query('DELETE FROM diagram_versions WHERE diagram_id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to clear diagram versions', { error: err.message, id });
    res.status(500).json({ error: 'Failed to clear versions' });
  }
});

router.delete('/:id', clerkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const result = await deleteDiagramHandler({ db: pool, diagramId: id, userId });
    res.status(result.status).json(result.body);
  } catch (err) {
    logger.error('Error deleting diagram', { error: err.message, id: req.params.id });
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
      code = buildInviteCode();
      await pool.query('UPDATE diagrams SET invite_code = $1 WHERE id = $2', [code, id]);
    }

    res.json({ inviteCode: code });
  } catch (err) {
    logger.error('Failed to manage invite', { error: err.message, id: req.params.id });
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
    logger.error('Failed to join diagram', { error: err.message, code: req.params.code });
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
    logger.error('Failed to fetch collaborators', { error: err.message, id: req.params.id });
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
    logger.error('Failed to remove collaborator', { error: err.message, id: req.params.id });
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

export default router;
