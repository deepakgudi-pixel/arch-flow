import crypto from 'crypto';
import pool from '../db/pool.js';
import { logger } from './logger.js';

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
    await pool.query(
      `INSERT INTO ai_failures (kind, model, prompt_hash, input_payload, raw_response, error_message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        kind,
        model || null,
        hashFailureInput(inputPayload),
        JSON.stringify(inputPayload || {}),
        rawResponse || null,
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
