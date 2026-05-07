import { readFile } from 'fs/promises';
import pool from './pool.js';

const schemaUrl = new URL('./schema.sql', import.meta.url);

export async function initializeDatabase() {
  try {
    const schemaSql = await readFile(schemaUrl, 'utf8');
    
    // Ensure new columns exist for collaboration
    await pool.query('ALTER TABLE diagrams ADD COLUMN IF NOT EXISTS invite_code VARCHAR(50) UNIQUE;');
    
    await pool.query(schemaSql);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization failed:', err);
    throw err;
  }
}
