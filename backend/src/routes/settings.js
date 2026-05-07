import express from 'express';
import pool from '../db/pool.js';
import { clerkAuth } from '../middleware/clerkAuth.js';
import { ensureUserExists } from '../services/userSync.js';

const router = express.Router();

router.get('/', clerkAuth, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const result = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        connection_mode: 'guided',
        default_template: 'blank',
        autosave_interval: 30,
        theme: 'light'
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/', clerkAuth, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { connection_mode, default_template, autosave_interval, theme } = req.body;

    await ensureUserExists(req.user);

    const existing = await pool.query(
      'SELECT user_id FROM user_settings WHERE user_id = $1',
      [userId]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO user_settings (user_id, connection_mode, default_template, autosave_interval, theme) VALUES ($1, $2, $3, $4, $5)',
        [userId, connection_mode || 'guided', default_template || 'blank', autosave_interval || 30, theme || 'light']
      );
    } else {
      await pool.query(
        `UPDATE user_settings SET
          connection_mode = COALESCE($1, connection_mode),
          default_template = COALESCE($2, default_template),
          autosave_interval = COALESCE($3, autosave_interval),
          theme = COALESCE($4, theme),
          updated_at = NOW()
        WHERE user_id = $5`,
        [connection_mode, default_template, autosave_interval, theme, userId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.get('/connection-rules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM connection_rules');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching connection rules:', err);
    res.status(500).json({ error: 'Failed to fetch connection rules' });
  }
});

export default router;
