import pool from '../src/db/pool.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  try {
    console.log('Running migration...');
    await pool.query('ALTER TABLE diagrams ADD COLUMN IF NOT EXISTS invite_code VARCHAR(50) UNIQUE;');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS diagram_collaborators (
        diagram_id VARCHAR(50) NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (diagram_id, user_id)
      );
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_diagrams_invite_code ON diagrams(invite_code);');
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
