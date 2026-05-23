import crypto from 'crypto';
import { logger } from '../lib/logger.js';

async function rollbackTransaction(db, operation, diagramId, error) {
  try {
    await db.query('ROLLBACK');
  } catch (rollbackError) {
    logger.error('Failed to roll back diagram transaction', {
      operation,
      id: diagramId,
      error: rollbackError.message,
      original_error: error.message
    });
  }
}

export async function updateDiagramHandler({
  db,
  diagramId,
  userId,
  name,
  nodes,
  edges,
  recordVersion = false
}) {
  await db.query('BEGIN');

  try {
    const existing = await db.query(
      `SELECT user_id, nodes, edges FROM diagrams d 
       WHERE d.id = $1 AND (d.user_id = $2 OR EXISTS(SELECT 1 FROM diagram_collaborators WHERE diagram_id = $1 AND user_id = $2))`,
      [diagramId, userId]
    );

    if (existing.rows.length === 0) {
      await db.query('ROLLBACK');
      return { status: 403, body: { error: 'Permission denied' } };
    }

    await db.query(
      'UPDATE diagrams SET name = COALESCE($1, name), nodes = COALESCE($2, nodes), edges = COALESCE($3, edges), updated_at = NOW() WHERE id = $4',
      [name, nodes ? JSON.stringify(nodes) : null, edges ? JSON.stringify(edges) : null, diagramId]
    );

    if (recordVersion && (nodes || edges)) {
      await db.query(
        `INSERT INTO diagram_versions (diagram_id, nodes, edges, prompt_text)
         VALUES ($1, $2, $3, $4)`,
        [
          diagramId,
          nodes ? JSON.stringify(nodes) : JSON.stringify(existing.rows[0].nodes),
          edges ? JSON.stringify(edges) : JSON.stringify(existing.rows[0].edges),
          'MANUAL_UPDATE'
        ]
      );
    }

    await db.query('COMMIT');

    return { status: 200, body: { success: true } };
  } catch (error) {
    await rollbackTransaction(db, 'update', diagramId, error);
    throw error;
  }
}

export async function deleteDiagramHandler({ db, diagramId, userId }) {
  await db.query('BEGIN');

  try {
    const existing = await db.query(
      'SELECT id FROM diagrams WHERE id = $1 AND user_id = $2',
      [diagramId, userId]
    );

    if (existing.rows.length === 0) {
      await db.query('ROLLBACK');
      return { status: 404, body: { error: 'Diagram not found' } };
    }

    await db.query('DELETE FROM diagram_collaborators WHERE diagram_id = $1', [diagramId]);
    await db.query('DELETE FROM diagram_versions WHERE diagram_id = $1', [diagramId]);
    await db.query('DELETE FROM diagrams WHERE id = $1', [diagramId]);
    await db.query('COMMIT');

    return { status: 200, body: { success: true } };
  } catch (error) {
    await rollbackTransaction(db, 'delete', diagramId, error);
    throw error;
  }
}

export async function listDiagramVersionsHandler({ db, diagramId, userId }) {
  const existing = await db.query(
    `SELECT user_id FROM diagrams d 
     WHERE d.id = $1 AND (d.user_id = $2 OR EXISTS(SELECT 1 FROM diagram_collaborators WHERE diagram_id = $1 AND user_id = $2))`,
    [diagramId, userId]
  );

  if (existing.rows.length === 0) {
    return { status: 403, body: { error: 'Permission denied' } };
  }

  const versions = await db.query(
    `SELECT id, prompt_text, nodes, edges, created_at AT TIME ZONE 'UTC' as created_at
     FROM diagram_versions WHERE diagram_id = $1 ORDER BY created_at DESC`,
    [diagramId]
  );

  return {
    status: 200,
    body: versions.rows.map(version => ({
      ...version,
      created_at: version.created_at instanceof Date ? version.created_at.toISOString() : version.created_at
    }))
  };
}

export async function saveGenerationVersionHandler({
  db,
  diagramId,
  promptHash,
  promptText,
  nodes,
  edges,
  rawResponse
}) {
  await db.query(
    `INSERT INTO diagram_versions (diagram_id, prompt_hash, prompt_text, nodes, edges, raw_response)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      diagramId || null,
      promptHash,
      promptText,
      JSON.stringify(nodes || []),
      JSON.stringify(edges || []),
      rawResponse || ''
    ]
  );

  return { status: 200, body: { success: true } };
}

export function buildInviteCode(bytes = crypto.randomBytes(6)) {
  return bytes.toString('hex').toUpperCase();
}
