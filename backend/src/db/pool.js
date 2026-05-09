import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

function normalizeConnectionString(value) {
  if (!value) {
    return value;
  }

  const parsed = new URL(value);
  const sslMode = parsed.searchParams.get('sslmode');

  if (sslMode && !parsed.searchParams.has('uselibpqcompat')) {
    parsed.searchParams.set('uselibpqcompat', 'true');
  }

  return parsed.toString();
}

const connectionString = normalizeConnectionString(process.env.NEON_DB_URL);

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('sslmode=')
    ? undefined
    : { rejectUnauthorized: false }
});

export default pool;
