import axios from 'axios';

const TOKEN_KEY = 'gigshield.token';
const USER_KEY = 'gigshield.user';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getStoredToken = () => window.localStorage.getItem(TOKEN_KEY);

const getStoredUser = () => {
  const value = window.localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
};

const persistAuth = ({ token, user }) => {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearStoredAuth = () => {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredAuth();
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async ({ name, email, password }) => {
    await api.post('/auth/register', {
      name: name.trim(),
      email: email.trim(),
      password,
    });

    const loginResponse = await api.post('/auth/login', {
      email: email.trim(),
      password,
    });

    persistAuth(loginResponse.data);
    return loginResponse;
  },

  login: async ({ email, password }) => {
    const response = await api.post('/auth/login', {
      email: email.trim(),
      password,
    });

    persistAuth(response.data);
    return response;
  },

  logout: () => {
    clearStoredAuth();
  },

  getStoredUser,

  isAuthenticated: () => Boolean(getStoredToken()),
};

export const policiesAPI = {
  getPolicies: () => api.get('/policies'),

  createPolicy: (data) =>
    api.post('/policies', {
      city: data.city.trim(),
      vehicleType: data.vehicleType,
      hoursPerWeek: Number(data.hoursPerWeek),
      coverageCap: Number(data.coverageCap),
    }),
};

export const premiumAPI = {
  calculatePremium: (data) =>
    api.post('/premium/calculate', {
      vehicleType: data.vehicleType,
      hoursPerWeek: Number(data.hoursPerWeek),
      coverageCap: Number(data.coverageCap),
    }),
};

export const claimsAPI = {
  getAllClaims: () => api.get('/claims'),

  createClaim: (data) =>
    api.post('/claims', {
      policyId: data.policyId,
      eventType: data.eventType.trim(),
      description: data.description.trim(),
      amount: Number(data.amount),
    }),
};

export const weatherAPI = {
  getCurrentWeather: () =>
    Promise.resolve({
      data: {
        condition: 'Partly Cloudy',
        temperature: 32,
        humidity: 65,
        alert: 'Heavy rain expected later today',
        riskLevel: 'medium',
      },
    }),
};

export { api };
export default api;
