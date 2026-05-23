import test from 'node:test';
import assert from 'node:assert/strict';
import { runMigrations, verifySchemaCompatibility } from '../src/db/migrate.js';
import { clerkAuth, optionalAuth } from '../src/middleware/clerkAuth.js';
import { validate } from '../src/middleware/validate.js';
import {
  buildInviteCode,
  deleteDiagramHandler,
  listDiagramVersionsHandler,
  saveGenerationVersionHandler,
  updateDiagramHandler
} from '../src/routes/diagramRouteHandlers.js';

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

test('auth middleware protects write endpoints while optional auth allows public reads', async () => {
  const protectedResponse = {
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
  let protectedNextCalled = false;

  await clerkAuth(
    { headers: {} },
    protectedResponse,
    () => {
      protectedNextCalled = true;
    }
  );

  assert.equal(protectedNextCalled, false);
  assert.equal(protectedResponse.statusCode, 401);
  assert.equal(protectedResponse.payload.error, 'No token provided');

  const optionalReq = { headers: {} };
  let optionalNextCalled = false;

  await optionalAuth(optionalReq, {}, () => {
    optionalNextCalled = true;
  });

  assert.equal(optionalNextCalled, true);
  assert.equal(optionalReq.user, null);
});

test('diagram update persists nodes and creates manual history when requested', async () => {
  const calls = [];
  const db = {
    async query(sql, params = []) {
      calls.push({ sql, params });

      if (/SELECT user_id, nodes, edges FROM diagrams/i.test(sql)) {
        return {
          rows: [
            {
              user_id: 'user_1',
              nodes: [{ id: 'old_node', name: 'Old API' }],
              edges: [{ id: 'old_edge', source: 'old_node', target: 'db' }]
            }
          ]
        };
      }

      return { rows: [] };
    }
  };
  const nodes = [{ id: 'api', name: 'API', category: 'backend' }];
  const edges = [{ id: 'e1', source: 'api', target: 'db', label: 'SQL' }];

  const result = await updateDiagramHandler({
    db,
    diagramId: 'd_test',
    userId: 'user_1',
    name: 'Updated System',
    nodes,
    edges,
    recordVersion: true
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { success: true });
  assert.equal(calls.filter(call => String(call.sql).trim() === 'BEGIN').length, 1);
  assert.equal(calls.filter(call => String(call.sql).trim() === 'COMMIT').length, 1);

  const accessCall = calls.find(call => /SELECT user_id, nodes, edges FROM diagrams/i.test(call.sql));
  assert.ok(accessCall);
  assert.match(accessCall.sql, /diagram_collaborators/);

  const updateCall = calls.find(call => /UPDATE diagrams SET/i.test(call.sql));
  assert.ok(updateCall);
  assert.equal(updateCall.params[0], 'Updated System');
  assert.equal(updateCall.params[1], JSON.stringify(nodes));
  assert.equal(updateCall.params[2], JSON.stringify(edges));

  const versionCall = calls.find(call => /INSERT INTO diagram_versions/i.test(call.sql));
  assert.ok(versionCall);
  assert.equal(versionCall.params[0], 'd_test');
  assert.equal(versionCall.params[1], JSON.stringify(nodes));
  assert.equal(versionCall.params[2], JSON.stringify(edges));
  assert.equal(versionCall.params[3], 'MANUAL_UPDATE');
});

test('diagram update denies non-owner and does not write history', async () => {
  const calls = [];
  const db = {
    async query(sql, params = []) {
      calls.push({ sql, params });
      return { rows: [] };
    }
  };

  const result = await updateDiagramHandler({
    db,
    diagramId: 'd_private',
    userId: 'user_other',
    nodes: [{ id: 'api' }],
    edges: [],
    recordVersion: true
  });

  assert.equal(result.status, 403);
  assert.equal(result.body.error, 'Permission denied');
  assert.equal(calls.filter(call => String(call.sql).trim() === 'BEGIN').length, 1);
  assert.equal(calls.filter(call => String(call.sql).trim() === 'ROLLBACK').length, 1);
  assert.equal(calls.filter(call => /UPDATE diagrams SET/i.test(call.sql)).length, 0);
  assert.equal(calls.filter(call => /INSERT INTO diagram_versions/i.test(call.sql)).length, 0);
});

test('diagram update rolls back when manual history cannot be written', async () => {
  const calls = [];
  const db = {
    async query(sql, params = []) {
      calls.push({ sql, params });

      if (/SELECT user_id, nodes, edges FROM diagrams/i.test(sql)) {
        return {
          rows: [
            {
              user_id: 'user_1',
              nodes: [{ id: 'old_node', name: 'Old API' }],
              edges: []
            }
          ]
        };
      }

      if (/INSERT INTO diagram_versions/i.test(sql)) {
        throw new Error('version insert failed');
      }

      return { rows: [] };
    }
  };

  await assert.rejects(
    () => updateDiagramHandler({
      db,
      diagramId: 'd_test',
      userId: 'user_1',
      nodes: [{ id: 'api', name: 'API' }],
      edges: [],
      recordVersion: true
    }),
    /version insert failed/
  );

  assert.equal(calls.filter(call => String(call.sql).trim() === 'BEGIN').length, 1);
  assert.equal(calls.filter(call => String(call.sql).trim() === 'ROLLBACK').length, 1);
  assert.equal(calls.filter(call => String(call.sql).trim() === 'COMMIT').length, 0);
});

test('generation persistence stores prompt hash, raw response, nodes, and edges', async () => {
  const calls = [];
  const db = {
    async query(sql, params = []) {
      calls.push({ sql, params });
      return { rows: [] };
    }
  };
  const nodes = [{ id: 'api', name: 'API', category: 'backend' }];
  const edges = [{ id: 'e1', source: 'api', target: 'db', label: 'SQL' }];

  await saveGenerationVersionHandler({
    db,
    diagramId: 'd_ai',
    promptHash: 'hash_123',
    promptText: 'AI_SYNTHESIS: Stripe',
    nodes,
    edges,
    rawResponse: '{"nodes":[]}'
  });

  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /INSERT INTO diagram_versions/);
  assert.deepEqual(calls[0].params, [
    'd_ai',
    'hash_123',
    'AI_SYNTHESIS: Stripe',
    JSON.stringify(nodes),
    JSON.stringify(edges),
    '{"nodes":[]}'
  ]);
});

test('diagram version listing enforces access and normalizes dates', async () => {
  const createdAt = new Date('2026-05-23T10:20:30.000Z');
  const db = {
    async query(sql) {
      if (/SELECT user_id FROM diagrams/i.test(sql)) {
        return { rows: [{ user_id: 'user_1' }] };
      }

      if (/SELECT id, prompt_text, nodes, edges/i.test(sql)) {
        return {
          rows: [
            {
              id: 'v1',
              prompt_text: 'MANUAL_UPDATE',
              nodes: [{ id: 'api' }],
              edges: [],
              created_at: createdAt
            }
          ]
        };
      }

      return { rows: [] };
    }
  };

  const result = await listDiagramVersionsHandler({ db, diagramId: 'd_test', userId: 'user_1' });

  assert.equal(result.status, 200);
  assert.equal(result.body[0].created_at, createdAt.toISOString());
});

test('diagram version listing denies users without owner or collaborator access', async () => {
  const calls = [];
  const db = {
    async query(sql, params = []) {
      calls.push({ sql, params });
      return { rows: [] };
    }
  };

  const result = await listDiagramVersionsHandler({ db, diagramId: 'd_private', userId: 'user_other' });

  assert.equal(result.status, 403);
  assert.equal(result.body.error, 'Permission denied');
  assert.equal(calls.filter(call => /SELECT user_id FROM diagrams/i.test(call.sql)).length, 1);
  assert.equal(calls.filter(call => /SELECT id, prompt_text, nodes, edges/i.test(call.sql)).length, 0);
});

test('diagram delete removes related records transactionally for owners', async () => {
  const calls = [];
  const db = {
    async query(sql, params = []) {
      calls.push({ sql, params });

      if (/SELECT id FROM diagrams WHERE id = \$1 AND user_id = \$2/i.test(sql)) {
        return { rows: [{ id: 'd_test' }] };
      }

      return { rows: [] };
    }
  };

  const result = await deleteDiagramHandler({ db, diagramId: 'd_test', userId: 'user_1' });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { success: true });
  assert.equal(calls.filter(call => String(call.sql).trim() === 'BEGIN').length, 1);
  assert.equal(calls.filter(call => String(call.sql).trim() === 'COMMIT').length, 1);
  assert.ok(calls.find(call => /DELETE FROM diagram_collaborators/i.test(call.sql)));
  assert.ok(calls.find(call => /DELETE FROM diagram_versions/i.test(call.sql)));
  assert.ok(calls.find(call => /DELETE FROM diagrams WHERE id/i.test(call.sql)));
});

test('diagram delete denies collaborators and rolls back without deleting data', async () => {
  const calls = [];
  const db = {
    async query(sql, params = []) {
      calls.push({ sql, params });
      return { rows: [] };
    }
  };

  const result = await deleteDiagramHandler({ db, diagramId: 'd_private', userId: 'user_collab' });

  assert.equal(result.status, 404);
  assert.equal(result.body.error, 'Diagram not found');
  assert.equal(calls.filter(call => String(call.sql).trim() === 'BEGIN').length, 1);
  assert.equal(calls.filter(call => String(call.sql).trim() === 'ROLLBACK').length, 1);
  assert.equal(calls.filter(call => /DELETE FROM/i.test(call.sql)).length, 0);
});

test('diagram delete rolls back if a related delete fails', async () => {
  const calls = [];
  const db = {
    async query(sql, params = []) {
      calls.push({ sql, params });

      if (/SELECT id FROM diagrams WHERE id = \$1 AND user_id = \$2/i.test(sql)) {
        return { rows: [{ id: 'd_test' }] };
      }

      if (/DELETE FROM diagram_versions/i.test(sql)) {
        throw new Error('version delete failed');
      }

      return { rows: [] };
    }
  };

  await assert.rejects(
    () => deleteDiagramHandler({ db, diagramId: 'd_test', userId: 'user_1' }),
    /version delete failed/
  );

  assert.equal(calls.filter(call => String(call.sql).trim() === 'BEGIN').length, 1);
  assert.equal(calls.filter(call => String(call.sql).trim() === 'ROLLBACK').length, 1);
  assert.equal(calls.filter(call => String(call.sql).trim() === 'COMMIT').length, 0);
});

test('invite code generation stays uppercase and deterministic for supplied bytes', () => {
  assert.equal(buildInviteCode(Buffer.from('abcdef123456', 'hex')), 'ABCDEF123456');
});
