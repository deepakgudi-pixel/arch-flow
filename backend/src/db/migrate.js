import { readdir, readFile } from 'fs/promises';

const migrationsDir = new URL('./migrations/', import.meta.url);

async function ensureMigrationTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

async function listMigrationFiles() {
  const files = await readdir(migrationsDir, { withFileTypes: true });
  return files
    .filter(file => file.isFile() && file.name.endsWith('.sql'))
    .map(file => file.name)
    .sort((left, right) => left.localeCompare(right));
}

export async function runMigrations(pool) {
  await ensureMigrationTable(pool);

  const migrationFiles = await listMigrationFiles();

  for (const fileName of migrationFiles) {
    await pool.query('BEGIN');

    try {
      await pool.query('LOCK TABLE schema_migrations IN ACCESS EXCLUSIVE MODE');

      const appliedResult = await pool.query(
        'SELECT id FROM schema_migrations WHERE id = $1',
        [fileName]
      );

      if (appliedResult.rows.length > 0) {
        await pool.query('COMMIT');
        continue;
      }

      const sql = await readFile(new URL(fileName, migrationsDir), 'utf8');

      await pool.query(sql);
      await pool.query(
        'INSERT INTO schema_migrations (id) VALUES ($1)',
        [fileName]
      );
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw new Error(`Migration ${fileName} failed: ${error.message}`);
    }
  }
}

export async function verifySchemaCompatibility(pool) {
  const requiredColumnsByTable = {
    diagrams: ['invite_code'],
    diagram_versions: ['prompt_hash', 'prompt_text', 'raw_response'],
    users: ['id', 'email'],
    user_settings: ['connection_mode'],
    ai_failures: ['kind', 'input_payload', 'raw_response', 'error_message']
  };

  for (const [tableName, requiredColumns] of Object.entries(requiredColumnsByTable)) {
    const result = await pool.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1`,
      [tableName]
    );
    const availableColumns = new Set(result.rows.map(row => row.column_name));
    const missingColumns = requiredColumns.filter(column => !availableColumns.has(column));

    if (missingColumns.length > 0) {
      throw new Error(`Schema compatibility check failed for ${tableName}: missing ${missingColumns.join(', ')}`);
    }
  }
}
