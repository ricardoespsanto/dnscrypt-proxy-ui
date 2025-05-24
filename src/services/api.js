import axios from 'axios';
import { API_CONFIG } from '../config/defaults';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens or other headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    // Handle different error scenarios
    if (response) {
      switch (response.status) {
        case 401:
          // Handle unauthorized
          break;
        case 403:
          // Handle forbidden
          break;
        case 404:
          // Handle not found
          break;
        case 500:
          // Handle server error
          break;
        default:
          // Handle other errors
          break;
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
const endpoints = {
  logs: '/logs',
  settings: '/settings',
  resolvers: '/resolvers',
  blocklists: '/blocklists',
};

// Log related API calls
export const logsApi = {
  fetch: async (limit = 100) => {
    try {
      const response = await api.get(`${endpoints.logs}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw new Error('Failed to fetch logs');
    }
  },

  clear: async () => {
    try {
      const response = await api.delete(endpoints.logs);
      return response.data;
    } catch (error) {
      console.error('Error clearing logs:', error);
      throw new Error('Failed to clear logs');
    }
  },

  getLevels: () => ['emerg', 'alert', 'crit', 'error', 'warn', 'notice', 'info', 'debug'],
};

// Settings related API calls
export const settingsApi = {
  fetch: async () => {
    try {
      const response = await api.get(endpoints.settings);
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw new Error('Failed to fetch settings');
    }
  },

  save: async (settings) => {
    try {
      const response = await api.post(endpoints.settings, settings);
      return response.data;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  },
};

// Resolver related API calls
export const resolversApi = {
  fetch: async () => {
    try {
      const response = await api.get(endpoints.resolvers);
      return response.data;
    } catch (error) {
      console.error('Error fetching resolvers:', error);
      throw new Error('Failed to fetch resolvers');
    }
  },

  save: async (resolvers) => {
    try {
      const response = await api.post(endpoints.resolvers, resolvers);
      return response.data;
    } catch (error) {
      console.error('Error saving resolvers:', error);
      throw new Error('Failed to save resolvers');
    }
  },
};

// Blocklist related API calls
export const blocklistsApi = {
  fetch: async () => {
    try {
      const response = await api.get(endpoints.blocklists);
      return response.data;
    } catch (error) {
      console.error('Error fetching blocklists:', error);
      throw new Error('Failed to fetch blocklists');
    }
  },

  save: async (blocklists) => {
    try {
      const response = await api.post(endpoints.blocklists, blocklists);
      return response.data;
    } catch (error) {
      console.error('Error saving blocklists:', error);
      throw new Error('Failed to save blocklists');
    }
  },
};

// Add metrics API
export const metricsApi = {
  fetch: async () => {
    try {
      const response = await api.get('/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  }
};

// Add service control API
export const serviceApi = {
  getStatus: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/service/status`);
    if (!response.ok) throw new Error('Failed to get service status');
    return response.json();
  },

  control: async (action) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    });
    if (!response.ok) throw new Error(`Failed to ${action} service`);
    return response.json();
  },

  getMetrics: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/service/metrics`);
    if (!response.ok) throw new Error('Failed to get service metrics');
    return response.json();
  },
};

// Export all API modules
export default {
  logs: logsApi,
  settings: settingsApi,
  resolvers: resolversApi,
  blocklists: blocklistsApi,
  metrics: metricsApi,
  service: serviceApi,
}; 