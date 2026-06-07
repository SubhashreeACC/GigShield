// API helper for frontend — talks to Fastify backend via Next.js rewrite proxy
const API_BASE = '/api';

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;

  // Get auth token from localStorage (MVP dev mode)
  const token = typeof window !== 'undefined' ? localStorage.getItem('gs_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // Safely parse response — handle non-JSON (e.g. when backend is down)
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // Response isn't JSON — backend is likely not running
    // Return empty response so pages render their empty/logged-out states
    return { data: null, error: `API unavailable (${res.status})` };
  }

  if (!res.ok) {
    // Auth errors are expected when not logged in — don't throw
    if (res.status === 401 || res.status === 403) {
      return { data: null, error: data.message || 'Not authenticated' };
    }
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// Auth
export const api = {
  // Plans (public)
  getPlans: () => apiFetch('/plans'),

  // Auth (MVP: phone-as-token)
  login: (phone) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gs_token', phone);
    }
    return apiFetch('/users/me');
  },

  // Register a new user
  register: (userData) =>
    apiFetch('/users/register', { method: 'POST', body: JSON.stringify(userData) }),

  // Validate login (check if user exists)
  loginValidate: (identifier) =>
    apiFetch('/users/login', { method: 'POST', body: JSON.stringify(identifier) }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gs_token');
      localStorage.removeItem('gs_current_user');
    }
  },

  // User
  getMe: () => apiFetch('/users/me'),
  onboard: (data) => apiFetch('/users/onboard', { method: 'POST', body: JSON.stringify(data) }),

  // Subscriptions
  createSubscription: (planId) =>
    apiFetch('/subscriptions', { method: 'POST', body: JSON.stringify({ planId }) }),
  getActiveSubscription: () => apiFetch('/subscriptions/active'),
  renewSubscription: () => apiFetch('/subscriptions/renew', { method: 'POST' }),

  // Claims
  getClaims: (page = 1, status = '') =>
    apiFetch(`/claims?page=${page}${status ? `&status=${status}` : ''}`),
  getClaimDetail: (id) => apiFetch(`/claims/${id}`),
  createClaim: (claimData) =>
    apiFetch('/claims', { method: 'POST', body: JSON.stringify(claimData) }),

  // Weather & Triggers
  getWeather: (city) => apiFetch(`/weather/${city}`),
  getTriggerStatus: () => apiFetch('/triggers/status'),

  // Admin
  admin: {
    getOverview: () => apiFetch('/admin/overview'),
    getUsers: (page = 1, search = '') =>
      apiFetch(`/admin/users?page=${page}${search ? `&search=${search}` : ''}`),
    getClaims: (page = 1, status = '') =>
      apiFetch(`/admin/claims?page=${page}${status ? `&status=${status}` : ''}`),
    getFraudAlerts: (page = 1) => apiFetch(`/admin/fraud-alerts?page=${page}`),
    getTriggerEvents: (page = 1) => apiFetch(`/admin/trigger-events?page=${page}`),
    approveClaim: (id) => apiFetch(`/admin/claims/${id}/approve`, { method: 'POST' }),
    rejectClaim: (id) => apiFetch(`/admin/claims/${id}/reject`, { method: 'POST' }),
  },
};

