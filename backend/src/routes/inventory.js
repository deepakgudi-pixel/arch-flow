import express from 'express';
import pool from '../db/pool.js';
import { clerkAuth, optionalAuth } from '../middleware/clerkAuth.js';
import { ensureUserExists } from '../services/userSync.js';
import { validate } from '../middleware/validate.js';
import { builtInTech } from '../lib/tech.js';

const router = express.Router();

function generateId() {
  return 'inv_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = {
      builtIn: builtInTech,
      community: []
    };

    // Fetch all community-created tech blocks
    const communityResult = await pool.query(
      'SELECT id, user_id as creator_id, name, category, description, products, icon FROM user_inventory ORDER BY created_at DESC'
    );

    result.community = communityResult.rows.map(item => ({
      id: item.id,
      creatorId: item.creator_id,
      name: item.name,
      category: item.category,
      description: item.description,
      products: item.products,
      icon: item.icon,
      isOwner: req.user ? req.user.id === item.creator_id : false
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

router.post('/', clerkAuth, validate({
  name: { required: true, type: 'string', maxLength: 100 },
  category: { required: true, type: 'string', maxLength: 50 },
  description: { type: 'string', maxLength: 500 },
  icon: { type: 'string', maxLength: 50 },
  products: { type: 'array' }
}), async (req, res) => {
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
