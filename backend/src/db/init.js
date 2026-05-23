import pool from './pool.js';
import { syncCanonicalConnectionRules } from '../lib/connectionRules.js';
import { runMigrations, verifySchemaCompatibility } from './migrate.js';
import { logger } from '../lib/logger.js';

export async function initializeDatabase() {
  try {
    await runMigrations(pool);
    await verifySchemaCompatibility(pool);
    await syncCanonicalConnectionRules(pool);
    logger.info('DATABASE_INITIALIZED');
  } catch (err) {
    logger.error('DATABASE_INITIALIZATION_FAILED', { error: err.message });
    throw err;
  }
}
