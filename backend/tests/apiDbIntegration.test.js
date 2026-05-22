import test from 'node:test';
import assert from 'node:assert/strict';
import { runMigrations, verifySchemaCompatibility } from '../src/db/migrate.js';
import { validate } from '../src/middleware/validate.js';

function createMigrationPool() {
  const calls = [];

  return {
    calls,
    async query(sql, params = []) {
      calls.push({ sql, params });

      if (/SELECT id FROM schema_migrations/i.test(sql)) {
        return { rows: [] };
      }

      return { rows: [] };
    }
  };
}

function createSchemaPool(columnsByTable) {
  return {
    async query(sql, params = []) {
      if (/information_schema\.columns/i.test(sql)) {
        const tableName = params[0];
        return {
          rows: (columnsByTable[tableName] || []).map(column_name => ({ column_name }))
        };
      }

      return { rows: [] };
    }
  };
}

test('runMigrations applies pending SQL files transactionally', async () => {
  const pool = createMigrationPool();

  await runMigrations(pool);

  const statements = pool.calls.map(call => String(call.sql).trim());
  assert.ok(statements.some(statement => statement.startsWith('CREATE TABLE IF NOT EXISTS schema_migrations')));
  assert.equal(statements.filter(statement => statement === 'BEGIN').length, 3);
  assert.equal(statements.filter(statement => statement === 'COMMIT').length, 3);
  assert.equal(statements.filter(statement => statement.startsWith('INSERT INTO schema_migrations')).length, 3);
});

test('verifySchemaCompatibility fails clearly when required DB columns are missing', async () => {
  const completeColumns = {
    diagrams: ['invite_code'],
    diagram_versions: ['prompt_hash', 'prompt_text', 'raw_response'],
    users: ['id', 'email'],
    user_settings: ['connection_mode'],
    ai_failures: ['kind', 'input_payload', 'raw_response', 'error_message']
  };

  await verifySchemaCompatibility(createSchemaPool(completeColumns));

  await assert.rejects(
    () => verifySchemaCompatibility(createSchemaPool({ ...completeColumns, diagrams: [] })),
    /diagrams: missing invite_code/
  );
});

function runValidation(schema, body) {
  const req = { body };
  const response = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
  let nextCalled = false;

  validate(schema)(req, response, () => {
    nextCalled = true;
  });

  return { response, nextCalled };
}

test('API validation middleware accepts valid payloads and rejects invalid ones', () => {
  const schema = {
    name: { type: 'string', maxLength: 20 },
    template: { type: 'string', enum: ['blank', 'saas'] }
  };
  const invalid = runValidation(schema, { name: 'this name is far too long', template: 'nope' });
  assert.equal(invalid.nextCalled, false);
  assert.equal(invalid.response.statusCode, 400);
  assert.equal(invalid.response.payload.error, 'Validation failed');
  assert.ok(invalid.response.payload.details.includes('name must be at most 20 characters'));
  assert.ok(invalid.response.payload.details.includes('template must be one of: blank, saas'));

  const valid = runValidation(schema, { name: 'Demo', template: 'saas' });
  assert.equal(valid.nextCalled, true);
  assert.equal(valid.response.payload, null);
});
