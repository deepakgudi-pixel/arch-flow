const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export const FALLBACK_FREE_MODEL = process.env.OPENROUTER_FALLBACK_MODEL || 'openrouter/free';
export const DIAGRAM_MODEL = process.env.OPENROUTER_DIAGRAM_MODEL || 'openrouter/auto';
export const TECH_MODEL = process.env.OPENROUTER_TECH_MODEL || 'openrouter/auto';

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

async function sendOpenRouterRequest(messages, model, signal, onChunk) {
  const isStreaming = typeof onChunk === 'function';
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://archflow.app',
      'X-Title': 'Archflow'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      stream: isStreaming
    }),
    signal
  });

  if (!response.ok) {
    const rawText = await response.text();
    throw new Error(`OpenRouter error: ${rawText}`);
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

export async function callOpenRouter(messages, primaryModel, onChunk, externalSignal) {
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
    return await sendOpenRouterRequest(messages, primaryModel, controller.signal, onChunk);
  } catch (error) {
    if (!shouldFallbackToFreeRouter(error) || primaryModel === FALLBACK_FREE_MODEL) {
      throw error;
    }

    console.warn(`OpenRouter model ${primaryModel} failed or timed out, retrying with ${FALLBACK_FREE_MODEL}`);
    const fallbackController = new AbortController();
    const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 120000);

    try {
      return await sendOpenRouterRequest(messages, FALLBACK_FREE_MODEL, fallbackController.signal, onChunk);
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
  maxAttempts = 2
}) {
  let lastParseError = null;
  let lastRawResponse = '';
  let currentMessages = messages;
  let resolvedModel = model;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await callOpenRouter(currentMessages, model);
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
    return JSON.parse(clean);
  } catch (error) {
    parseError = error;
    const candidates = extractBalancedJsonCandidates(clean);

    for (let index = candidates.length - 1; index >= 0; index -= 1) {
      try {
        return JSON.parse(candidates[index]);
      } catch {
        continue;
      }
    }

    console.error('JSON Parse Error. Raw text (first 500 chars):', text.slice(0, 500));
    throw new Error(`Failed to parse AI response: ${parseError.message}`);
  }
}
