const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

let authToken = null;
let tokenProvider = null;

async function parseResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('Content-Type') || '';

  if (contentType.includes('application/json')) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => '');
  return text || null;
}

function getStoredToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('archflow_token');
}

export function setToken(token) {
  authToken = token;
}

export function setTokenProvider(provider) {
  tokenProvider = provider;
}

export function clearToken() {
  authToken = null;

  if (typeof window !== 'undefined') {
    localStorage.removeItem('archflow_token');
  }
}

async function resolveAuthToken() {
  if (tokenProvider) {
    const freshToken = await tokenProvider();

    if (freshToken) {
      authToken = freshToken;

      if (typeof window !== 'undefined') {
        localStorage.setItem('archflow_token', freshToken);
      }

      return freshToken;
    }
  }

  return authToken || getStoredToken();
}

async function fetchAPI(endpoint, options = {}, retry = true) {
  const {
    suppressErrorLog = false,
    ...fetchOptions
  } = options;
  const token = await resolveAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...fetchOptions.headers
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const error =
      responseBody && typeof responseBody === 'object'
        ? responseBody
        : { error: typeof responseBody === 'string' && responseBody ? responseBody : 'Request failed' };

    if (
      retry &&
      response.status === 401 &&
      tokenProvider &&
      typeof error.error === 'string' &&
      error.error.includes('JWT is expired')
    ) {
      authToken = null;
      return fetchAPI(endpoint, options, false);
    }

    if (!suppressErrorLog) {
      console.error('API error:', response.status, error);
    }

    const apiError = new Error(error.error || 'Request failed');
    apiError.status = response.status;
    apiError.payload = error;
    throw apiError;
  }

  return responseBody;
}

export const api = {
  getDiagrams: () => fetchAPI('/diagrams'),
  createDiagram: (data) => fetchAPI('/diagrams', { method: 'POST', body: JSON.stringify(data) }),
  getDiagram: (id) => fetchAPI(`/diagrams/${id}`),
  updateDiagram: (id, data) => fetchAPI(`/diagrams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDiagram: (id) => fetchAPI(`/diagrams/${id}`, { method: 'DELETE' }),

  getInventory: () => fetchAPI('/inventory'),
  addToInventory: (data) => fetchAPI('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  deleteFromInventory: (id) => fetchAPI(`/inventory/${id}`, { method: 'DELETE' }),

  getSettings: () => fetchAPI('/settings'),
  updateSettings: (data) => fetchAPI('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getConnectionRules: () => fetchAPI('/settings/connection-rules'),

  generateDiagram: (data) => fetchAPI('/ai/generate-diagram', { method: 'POST', body: JSON.stringify(data) }),
  streamDiagram: async (data, onChunk, onResult, onError) => {
    const token = await resolveAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };

    try {
      const response = await fetch(`${API_URL}/ai/generate-diagram`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorBody = await parseResponseBody(response);
        const error =
          errorBody && typeof errorBody === 'object'
            ? errorBody
            : { error: typeof errorBody === 'string' && errorBody ? errorBody : 'Request failed' };
        throw new Error(error.error || 'Request failed');
      }

      // If it's a cached response, it might return a direct JSON
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const result = await parseResponseBody(response);
        onResult(result);
        return;
      }

      if (!response.body) {
        throw new Error('Stream response body missing');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let pendingChunk = '';
      let currentEvent = null;

      while (true) {
        const { done, value } = await reader.read();
        const chunk = value ? decoder.decode(value, { stream: !done }) : '';
        pendingChunk += chunk;

        const lines = pendingChunk.split(/\r?\n/);
        pendingChunk = done ? '' : lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line === '') {
            currentEvent = null;
          } else if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;
            
            try {
              const parsed = JSON.parse(dataStr);
              if (currentEvent === 'chunk') {
                onChunk(parsed.content);
              } else if (currentEvent === 'result') {
                onResult(parsed);
              } else if (currentEvent === 'error') {
                onError(parsed.error);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }

        if (done) {
          break;
        }
      }
    } catch (err) {
      onError(err.message);
    }
  },
  generateTech: (data) => fetchAPI('/ai/generate-tech', { method: 'POST', body: JSON.stringify(data) }),
  reviewDiagram: (data) => fetchAPI('/ai/review-diagram', { method: 'POST', body: JSON.stringify(data) }),
  inferConnection: (data) => fetchAPI('/ai/infer-connection', { method: 'POST', body: JSON.stringify(data) }),

  getDiagramVersions: (id) => fetchAPI(`/diagrams/${id}/versions`),
  clearDiagramVersions: (id) => fetchAPI(`/diagrams/${id}/versions`, { method: 'DELETE' }),
  getInviteCode: (id) => fetchAPI(`/diagrams/${id}/invite`, { method: 'POST' }),
  joinDiagram: (code) => fetchAPI(`/diagrams/join/${code}`, { method: 'POST' }),
  getCollaborators: (id) => fetchAPI(`/diagrams/${id}/collaborators`),
  removeCollaborator: (id, userId) => fetchAPI(`/diagrams/${id}/collaborators/${userId}`, { method: 'DELETE' }),

  syncUser: (options = {}) => fetchAPI('/users/sync', { method: 'POST', ...options })
};

export default api;
