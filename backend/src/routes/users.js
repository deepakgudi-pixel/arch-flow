import express from 'express';
import pool from '../db/pool.js';
import { clerkAuth } from '../middleware/clerkAuth.js';
import { ensureUserExists } from '../services/userSync.js';
import { logger } from '../lib/logger.js';

const router = express.Router();

router.post('/sync', clerkAuth, async (req, res) => {
  try {
    const { id } = req.user;
    const user = await ensureUserExists(req.user);

    const existing = await pool.query(
      'SELECT user_id FROM user_settings WHERE user_id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO user_settings (user_id, connection_mode, default_template, autosave_interval, theme) VALUES ($1, $2, $3, $4, $5)',
        [id, 'guided', 'blank', 30, 'light']
      );
    }

    res.json({ success: true, user });
  } catch (err) {
    logger.error('Error syncing user', { error: err.message });
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

router.get('/me', clerkAuth, async (req, res) => {
  try {
    const { id } = req.user;

    const result = await pool.query(
      'SELECT id, email, connection_mode, default_template, autosave_interval FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error fetching user', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
