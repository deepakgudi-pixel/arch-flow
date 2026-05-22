import crypto from 'crypto';
import { logger } from '../lib/logger.js';

export async function updateDiagramHandler({
  db,
  diagramId,
  userId,
  name,
  nodes,
  edges,
  recordVersion = false
}) {
  const existing = await db.query(
    `SELECT user_id, nodes, edges FROM diagrams d 
     WHERE d.id = $1 AND (d.user_id = $2 OR EXISTS(SELECT 1 FROM diagram_collaborators WHERE diagram_id = $1 AND user_id = $2))`,
    [diagramId, userId]
  );

  if (existing.rows.length === 0) {
    return { status: 403, body: { error: 'Permission denied' } };
  }

  await db.query(
    'UPDATE diagrams SET name = COALESCE($1, name), nodes = COALESCE($2, nodes), edges = COALESCE($3, edges), updated_at = NOW() WHERE id = $4',
    [name, nodes ? JSON.stringify(nodes) : null, edges ? JSON.stringify(edges) : null, diagramId]
  );

  if (recordVersion && (nodes || edges)) {
    try {
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
    } catch (error) {
      logger.error('Failed to save manual diagram version', { error: error.message, id: diagramId });
    }
  }

  return { status: 200, body: { success: true } };
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
