import { readFile } from 'fs/promises';
import pool from './pool.js';

const schemaUrl = new URL('./schema.sql', import.meta.url);

export async function initializeDatabase() {
  const schemaSql = await readFile(schemaUrl, 'utf8');
  await pool.query(schemaSql);
}
