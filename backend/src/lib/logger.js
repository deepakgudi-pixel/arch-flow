import crypto from 'crypto';

const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

class Logger {
  constructor(service) {
    this.service = service;
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      ...meta,
      request_id: meta.request_id || crypto.randomUUID().substring(0, 8)
    });
  }

  info(message, meta) {
    console.log(this.formatMessage(LOG_LEVELS.INFO, message, meta));
  }

  warn(message, meta) {
    console.warn(this.formatMessage(LOG_LEVELS.WARN, message, meta));
  }

  error(message, meta) {
    console.error(this.formatMessage(LOG_LEVELS.ERROR, message, meta));
  }

  // AI Specific Observability
  aiInteraction({ model, prompt_hash, duration_ms, status, tokens_estimated, is_cached }) {
    this.info('AI_INTERACTION', {
      type: 'ai_metrics',
      model,
      prompt_hash,
      duration_ms,
      status,
      tokens_estimated,
      is_cached
    });
  }

  cacheMetrics(action, key_hash, hit) {
    this.info('CACHE_METRIC', {
      type: 'cache',
      action, // 'GET', 'SET', 'EVICT'
      key_hash,
      hit
    });
  }
}

export const logger = new Logger('archflow-backend');
