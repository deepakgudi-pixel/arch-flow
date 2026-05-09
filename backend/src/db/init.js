import pool from './pool.js';
import { syncCanonicalConnectionRules } from '../lib/connectionRules.js';
import { runMigrations, verifySchemaCompatibility } from './migrate.js';

export async function initializeDatabase() {
  try {
    await runMigrations(pool);
    await verifySchemaCompatibility(pool);
    await syncCanonicalConnectionRules(pool);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization failed:', err);
    throw err;
  }
}
