const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export const FALLBACK_FREE_MODEL = process.env.OPENROUTER_FALLBACK_MODEL || 'openrouter/free';
export const DIAGRAM_MODEL = process.env.OPENROUTER_DIAGRAM_MODEL || 'openrouter/auto';
export const TECH_MODEL = process.env.OPENROUTER_TECH_MODEL || 'openrouter/auto';

const DEFAULT_JSON_MAX_TOKENS = parsePositiveInteger(process.env.OPENROUTER_JSON_MAX_TOKENS, 4096);
const CREDIT_SAFE_JSON_MAX_TOKENS = parsePositiveInteger(process.env.OPENROUTER_CREDIT_SAFE_JSON_MAX_TOKENS, 2048);
const MIN_USEFUL_JSON_MAX_TOKENS = 1024;
const DEFAULT_MODEL_FALLBACKS = parseModelList(process.env.OPENROUTER_MODEL_FALLBACKS || FALLBACK_FREE_MODEL);

function parsePositiveInteger(value, fallback = null) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseModelList(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item || '').trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function stripMarkdownFences(text) {
  return text.replace(/```json|```/gi, '').trim();
}

function extractBalancedJsonCandidates(text) {
  const candidates = [];
  let start = -1;
  let stack = [];
  let inString = false;
  let isEscaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (start === -1) {
      if (char === '{' || char === '[') {
        start = index;
        stack = [char];
        inString = false;
        isEscaped = false;
      }
      continue;
    }

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{' || char === '[') {
      stack.push(char);
      continue;
    }

    if (char === '}' || char === ']') {
      const expected = char === '}' ? '{' : '[';

      if (stack[stack.length - 1] !== expected) {
        start = -1;
        stack = [];
        inString = false;
        isEscaped = false;
        continue;
      }

      stack.pop();

      if (stack.length === 0) {
        candidates.push(text.slice(start, index + 1));
        start = -1;
      }
    }
  }

  return candidates;
}

function extractBalancedObjectCandidates(text) {
  const candidates = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (start === -1) {
      if (char === '{') {
        start = index;
        depth = 1;
        inString = false;
        isEscaped = false;
      }
      continue;
    }

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;

      if (depth === 0) {
        candidates.push(text.slice(start, index + 1));
        start = -1;
      }
    }
  }

  return candidates;
}

function isDiagramPayload(value) {
  if (Array.isArray(value)) {
    return value.some(isDiagramPayload);
  }

  return Boolean(
    value &&
    typeof value === 'object' &&
    Array.isArray(value.nodes) &&
    Array.isArray(value.edges)
  );
}

function unwrapDiagramPayload(value) {
  if (Array.isArray(value)) {
    return value.find(isDiagramPayload) || value[0];
  }

  return value;
}

function extractTokenBudget(message) {
  const requestedMatch = message.match(/requested up to\s+([\d,]+)/i);
  const affordableMatch = message.match(/can only afford\s+([\d,]+)/i);

  return {
    requestedTokens: requestedMatch ? Number.parseInt(requestedMatch[1].replace(/,/g, ''), 10) : null,
    affordableTokens: affordableMatch ? Number.parseInt(affordableMatch[1].replace(/,/g, ''), 10) : null
  };
}

export function createOpenRouterError(rawText, status) {
  let parsed = null;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = null;
  }

  const apiError = parsed?.error || {};
  const apiMessage = apiError.message || rawText || 'Request failed';
  const code = apiError.code || status;
  const { requestedTokens, affordableTokens } = extractTokenBudget(apiMessage);
  const isCreditLimit = (
    status === 402 ||
    code === 402 ||
    /more credits|fewer max_tokens/i.test(apiMessage)
  );

  const tokenDetail = requestedTokens && affordableTokens
    ? ` Available: ${affordableTokens} tokens; requested: ${requestedTokens}.`
    : '';
  const message = isCreditLimit
    ? `AI_CREDITS_LOW: OpenRouter rejected the generation because the response token budget is higher than the available credits.${tokenDetail} Add OpenRouter credits, lower OPENROUTER_JSON_MAX_TOKENS, or retry with a shorter prompt.`
    : `OpenRouter error: ${apiMessage}`;

  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.isCreditLimit = isCreditLimit;
  error.requestedTokens = requestedTokens;
  error.affordableTokens = affordableTokens;
  return error;
}

export function isOpenRouterCreditError(error) {
  return Boolean(
    error?.isCreditLimit ||
    error?.status === 402 ||
    error?.code === 402 ||
    (typeof error?.message === 'string' && /AI_CREDITS_LOW|more credits|fewer max_tokens/i.test(error.message))
  );
}

function resolveMaxTokens(jsonMode, options = {}) {
  return parsePositiveInteger(options.maxTokens, jsonMode ? DEFAULT_JSON_MAX_TOKENS : null);
}

function resolveModelFallbacks(model, options = {}) {
  const requestedFallbacks = options.modelFallbacks
    ? parseModelList(options.modelFallbacks)
    : DEFAULT_MODEL_FALLBACKS;

  return requestedFallbacks.filter(fallbackModel => fallbackModel && fallbackModel !== model);
}

function resolveResponseFormat(jsonMode, options = {}) {
  if (!jsonMode) {
    return null;
  }

  if (options.responseSchema && !options.disableResponseSchema) {
    return {
      type: 'json_schema',
      json_schema: {
        name: options.responseSchema.name || 'archflow_response',
        strict: options.responseSchema.strict !== false,
        schema: options.responseSchema.schema || options.responseSchema
      }
    };
  }

  return { type: 'json_object' };
}

export function buildOpenRouterRequestBody({
  messages,
  model,
  jsonMode,
  isStreaming = false,
  options = {}
}) {
  const maxTokens = resolveMaxTokens(jsonMode, options);
  const responseFormat = resolveResponseFormat(jsonMode, options);
  const modelFallbacks = resolveModelFallbacks(model, options);
  const body = {
    model,
    messages,
    temperature: jsonMode ? 0.1 : 0.7,
    stream: isStreaming,
    provider: {
      allow_fallbacks: true,
      ...(responseFormat?.type === 'json_schema' && { require_parameters: true })
    }
  };

  if (maxTokens) {
    body.max_tokens = maxTokens;
  }

  if (modelFallbacks.length > 0) {
    body.models = modelFallbacks;
  }

  if (responseFormat) {
    body.response_format = responseFormat;

    if (responseFormat.type === 'json_schema') {
      body.structured_outputs = true;
    }
  }

  return body;
}

export function resolveCreditSafeMaxTokens(error, currentMaxTokens, jsonMode) {
  if (!isOpenRouterCreditError(error)) {
    return null;
  }

  const configuredSafeCap = jsonMode ? CREDIT_SAFE_JSON_MAX_TOKENS : null;
  const currentCap = parsePositiveInteger(currentMaxTokens, configuredSafeCap);

  if (!currentCap || currentCap <= MIN_USEFUL_JSON_MAX_TOKENS) {
    return null;
  }

  let nextCap = Math.min(currentCap - 1, configuredSafeCap || currentCap - 1);
  if (error.affordableTokens) {
    nextCap = Math.min(nextCap, error.affordableTokens - 256);
  }

  return nextCap >= MIN_USEFUL_JSON_MAX_TOKENS ? nextCap : null;
}

function shouldRetryWithoutStrictSchema(error) {
  return Boolean(
    error?.message &&
    /require_parameters|structured output|response_format|json_schema|No endpoints found|support all parameters/i.test(error.message)
  );
}

async function sendOpenRouterRequest(messages, model, signal, onChunk, jsonMode, options = {}) {
  const isStreaming = typeof onChunk === 'function';
  const body = buildOpenRouterRequestBody({
    messages,
    model,
    jsonMode,
    isStreaming,
    options
  });
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://archflow.app',
      'X-Title': 'Archflow'
    },
    body: JSON.stringify(body),
    signal
  });

  if (!response.ok) {
    const rawText = await response.text();
    throw createOpenRouterError(rawText, response.status);
  }

  if (isStreaming) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (!line.startsWith('data: ')) {
          continue;
        }

        const data = line.slice(6);
        if (data === '[DONE]') {
          continue;
        }

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content || '';

          if (content) {
            fullContent += content;
            onChunk(content);
          }
        } catch (error) {
          console.error('Error parsing stream chunk:', error);
        }
      }
    }

    return { content: fullContent, model };
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || '',
    model: data.model || model
  };
}

function shouldFallbackToFreeRouter(error) {
  return (
    isOpenRouterCreditError(error) ||
    error.name === 'AbortError' ||
    (typeof error.message === 'string' &&
      (
        error.message.includes('No endpoints found') ||
        error.message.includes('timeout') ||
        error.message.includes('504') ||
        error.message.includes('429')
      ))
  );
}

export async function callOpenRouter(messages, primaryModel, onChunk, externalSignal, jsonMode, options = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000);

  if (externalSignal) {
    const onExternalAbort = () => { controller.abort(); };
    externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }

  try {
    return await sendOpenRouterRequest(messages, primaryModel, controller.signal, onChunk, jsonMode, options);
  } catch (error) {
    if (options.responseSchema && !options.disableResponseSchema && shouldRetryWithoutStrictSchema(error)) {
      console.warn(`OpenRouter provider could not satisfy strict schema, retrying ${primaryModel} with JSON mode`);
      try {
        return await sendOpenRouterRequest(
          messages,
          primaryModel,
          controller.signal,
          onChunk,
          jsonMode,
          { ...options, disableResponseSchema: true }
        );
      } catch (schemaRetryError) {
        error = schemaRetryError;
      }
    }

    const currentMaxTokens = resolveMaxTokens(jsonMode, options);
    const creditSafeMaxTokens = resolveCreditSafeMaxTokens(error, currentMaxTokens, jsonMode);
    let retryError = error;

    if (creditSafeMaxTokens) {
      console.warn(`OpenRouter credit limit hit, retrying ${primaryModel} with max_tokens=${creditSafeMaxTokens}`);
      try {
        return await sendOpenRouterRequest(
          messages,
          primaryModel,
          controller.signal,
          onChunk,
          jsonMode,
          { ...options, maxTokens: creditSafeMaxTokens }
        );
      } catch (creditRetryError) {
        retryError = creditRetryError;
      }
    }

    if (!shouldFallbackToFreeRouter(retryError) || primaryModel === FALLBACK_FREE_MODEL) {
      throw retryError;
    }

    console.warn(`OpenRouter model ${primaryModel} failed or timed out, retrying with ${FALLBACK_FREE_MODEL}`);
    const fallbackController = new AbortController();
    const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 120000);

    try {
      return await sendOpenRouterRequest(messages, FALLBACK_FREE_MODEL, fallbackController.signal, onChunk, jsonMode, options);
    } finally {
      clearTimeout(fallbackTimeoutId);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildJsonRepairMessages(messages, rawResponse, errorMessage, schemaHint) {
  return [
    ...messages,
    { role: 'assistant', content: rawResponse },
    {
      role: 'user',
      content: `Your previous response could not be parsed as valid JSON (${errorMessage}). Return ONLY valid JSON matching this shape: ${schemaHint}. Do not include markdown fences, prose, duplicate objects, or explanations.`
    }
  ];
}

export async function callOpenRouterForJSON({
  messages,
  model,
  schemaHint,
  maxAttempts = 2,
  maxTokens,
  responseSchema,
  modelFallbacks
}) {
  let lastParseError = null;
  let lastRawResponse = '';
  let currentMessages = messages;
  let resolvedModel = model;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await callOpenRouter(
      currentMessages,
      model,
      undefined,
      undefined,
      true,
      { maxTokens, responseSchema, modelFallbacks }
    );
    lastRawResponse = response.content;
    resolvedModel = response.model || model;

    try {
      return {
        data: robustParseJSON(lastRawResponse),
        rawResponse: lastRawResponse,
        model: resolvedModel,
        attempts: attempt
      };
    } catch (error) {
      lastParseError = error;

      if (attempt === maxAttempts) {
        break;
      }

      currentMessages = buildJsonRepairMessages(
        messages,
        lastRawResponse,
        error.message,
        schemaHint
      );
    }
  }

  const failure = new Error(
    `Failed to parse AI JSON response after ${maxAttempts} attempt(s): ${lastParseError?.message || 'Unknown parse error'}`
  );
  failure.rawResponse = lastRawResponse;
  failure.model = resolvedModel;
  throw failure;
}

export function robustParseJSON(text) {
  const clean = stripMarkdownFences(text);
  let parseError;

  try {
    return unwrapDiagramPayload(JSON.parse(clean));
  } catch (error) {
    parseError = error;
    const candidates = extractBalancedJsonCandidates(clean);

    for (let index = candidates.length - 1; index >= 0; index -= 1) {
      try {
        const parsed = JSON.parse(candidates[index]);
        if (isDiagramPayload(parsed)) {
          return unwrapDiagramPayload(parsed);
        }
      } catch {
        continue;
      }
    }

    const objectCandidates = extractBalancedObjectCandidates(clean);

    for (let index = objectCandidates.length - 1; index >= 0; index -= 1) {
      try {
        const parsed = JSON.parse(objectCandidates[index]);
        if (isDiagramPayload(parsed)) {
          return parsed;
        }
      } catch {
        continue;
      }
    }

    console.error('JSON Parse Error. Raw text (first 500 chars):', text.slice(0, 500));
    throw new Error(`Failed to parse AI response: ${parseError.message}`);
  }
}
