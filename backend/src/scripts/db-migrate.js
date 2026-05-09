import dotenv from 'dotenv';
dotenv.config();

import pool from '../db/pool.js';
import { assertBackendEnv } from '../config/env.js';
import { runMigrations, verifySchemaCompatibility } from '../db/migrate.js';

async function main() {
  assertBackendEnv({ requireAI: false, requireAuth: false });
  await runMigrations(pool);
  await verifySchemaCompatibility(pool);
  console.log('Database migrations completed successfully');
  await pool.end();
}

main().catch(async error => {
  console.error(error.message);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
