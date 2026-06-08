import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOpenRouterRequestBody,
  createOpenRouterError,
  isOpenRouterCreditError,
  resolveCreditSafeMaxTokens
} from '../src/lib/openRouter.js';
import { DIAGRAM_RESPONSE_SCHEMA } from '../src/lib/diagramGenerator/generationReviewGate.js';

test('OpenRouter credit errors are sanitized and keep token budget metadata', () => {
  const rawError = JSON.stringify({
    error: {
      message: 'This request requires more credits, or fewer max_tokens. You requested up to 8192 tokens, but can only afford 7817. To increase, visit https://openrouter.ai/settings/credits and upgrade to a paid account',
      code: 402,
      metadata: {
        previous_errors: [
          { code: 402, message: 'This request requires more credits, or fewer max_tokens.' }
        ]
      }
    }
  });

  const error = createOpenRouterError(rawError, 402);

  assert.equal(error.isCreditLimit, true);
  assert.equal(isOpenRouterCreditError(error), true);
  assert.equal(error.requestedTokens, 8192);
  assert.equal(error.affordableTokens, 7817);
  assert.match(error.message, /^AI_CREDITS_LOW:/);
  assert.doesNotMatch(error.message, /previous_errors/);
  assert.doesNotMatch(error.message, /settings\/credits/);
});

test('OpenRouter credit retry lowers an oversized JSON token cap', () => {
  const error = createOpenRouterError(JSON.stringify({
    error: {
      message: 'This request requires more credits, or fewer max_tokens. You requested up to 8192 tokens, but can only afford 7817.',
      code: 402
    }
  }), 402);

  assert.equal(resolveCreditSafeMaxTokens(error, 8192, true), 2048);
});

test('OpenRouter credit retry stops when too few tokens are affordable', () => {
  const error = createOpenRouterError(JSON.stringify({
    error: {
      message: 'This request requires more credits, or fewer max_tokens. You requested up to 4096 tokens, but can only afford 117.',
      code: 402
    }
  }), 402);

  assert.equal(resolveCreditSafeMaxTokens(error, 4096, true), null);
});

test('OpenRouter request body enables structured AI routing for diagram synthesis', () => {
  const body = buildOpenRouterRequestBody({
    model: 'openrouter/auto',
    messages: [{ role: 'user', content: 'Design Slack' }],
    jsonMode: true,
    isStreaming: true,
    options: {
      responseSchema: DIAGRAM_RESPONSE_SCHEMA,
      modelFallbacks: ['openrouter/free']
    }
  });

  assert.equal(body.stream, true);
  assert.equal(body.temperature, 0.1);
  assert.deepEqual(body.models, ['openrouter/free']);
  assert.equal(body.provider.allow_fallbacks, true);
  assert.equal(body.provider.require_parameters, true);
  assert.equal(body.response_format.type, 'json_schema');
  assert.equal(body.response_format.json_schema.name, 'archflow_diagram');
  assert.equal(body.response_format.json_schema.strict, true);
  assert.equal(body.structured_outputs, true);
});

test('OpenRouter request body can relax to JSON mode while keeping model fallbacks', () => {
  const body = buildOpenRouterRequestBody({
    model: 'openrouter/auto',
    messages: [{ role: 'user', content: 'Design Slack' }],
    jsonMode: true,
    options: {
      responseSchema: DIAGRAM_RESPONSE_SCHEMA,
      disableResponseSchema: true,
      modelFallbacks: ['openrouter/free']
    }
  });

  assert.equal(body.response_format.type, 'json_object');
  assert.equal(body.provider.allow_fallbacks, true);
  assert.equal(body.provider.require_parameters, undefined);
  assert.deepEqual(body.models, ['openrouter/free']);
  assert.equal(body.structured_outputs, undefined);
});
