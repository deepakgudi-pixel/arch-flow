const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

let authToken = null;
let tokenProvider = null;

function getStoredToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('archflow_token');
}

export function setToken(token) {
  authToken = token;
  console.log('Token set, length:', token?.length);
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
  const token = await resolveAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  console.log('Fetching:', `${API_URL}${endpoint}`, 'Auth header present:', !!token);
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));

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

    console.error('API error:', response.status, error);
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
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
  generateTech: (data) => fetchAPI('/ai/generate-tech', { method: 'POST', body: JSON.stringify(data) }),
  inferConnection: (data) => fetchAPI('/ai/infer-connection', { method: 'POST', body: JSON.stringify(data) }),

  getInviteCode: (id) => fetchAPI(`/diagrams/${id}/invite`, { method: 'POST' }),
  joinDiagram: (code) => fetchAPI(`/diagrams/join/${code}`, { method: 'POST' }),
  getCollaborators: (id) => fetchAPI(`/diagrams/${id}/collaborators`),
  removeCollaborator: (id, userId) => fetchAPI(`/diagrams/${id}/collaborators/${userId}`, { method: 'DELETE' }),

  syncUser: () => fetchAPI('/users/sync', { method: 'POST' })
};

export default api;
