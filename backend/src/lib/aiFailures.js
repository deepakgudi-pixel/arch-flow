import crypto from 'crypto';
import pool from '../db/pool.js';
import { logger } from './logger.js';

function sanitizePayload(payload) {
  if (!payload) return {};
  const sanitized = { ...payload };
  if (sanitized.description && sanitized.description.length > 500) {
    sanitized.description = sanitized.description.slice(0, 500);
  }
  return sanitized;
}

function hashFailureInput(inputPayload) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(inputPayload || {}))
    .digest('hex');
}

export async function recordAIFailure({
  kind,
  model,
  inputPayload,
  rawResponse,
  errorMessage
}) {
  try {
    const safePayload = sanitizePayload(inputPayload);
    await pool.query(
      `INSERT INTO ai_failures (kind, model, prompt_hash, input_payload, raw_response, error_message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        kind,
        model || null,
        hashFailureInput(safePayload),
        JSON.stringify(safePayload),
        rawResponse ? rawResponse.slice(0, 2000) : null,
        errorMessage
      ]
    );
  } catch (error) {
    logger.error('Failed to record AI failure', {
      error: error.message,
      kind
    });
  }
}
