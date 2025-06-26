import axios from 'axios';
import { API_CONFIG } from '../config/defaults';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
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
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded. Please try again later.');
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
  fetch: async () => {
    const response = await axios.get('/api/logs');
    return response.data;
  },
  getLogs: async (limit) => {
    const response = await axios.get(`/api/logs?limit=${limit}`);
    return response.data;
  },
  clear: async () => {
    const response = await axios.delete('/api/logs');
    return response.data;
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
  fetch: async (type = 'blacklist') => {
    try {
      const response = await api.get(`${endpoints.blocklists}?type=${type}`);
      
      // Validate response data
      if (!response.data || typeof response.data !== 'object') {
        throw new Error(`Invalid response format for ${type}`);
      }
      
      // Ensure blocklists is an array
      if (!Array.isArray(response.data.blocklists)) {
        response.data.blocklists = [];
      }
      
      // Ensure whitelist is an array
      if (!Array.isArray(response.data.whitelist)) {
        response.data.whitelist = [];
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      throw new Error(`Failed to fetch ${type}: ${error.message}`);
    }
  },

  save: async (data) => {
    try {
      const { blocklists, type = 'blacklist' } = data;
      
      // Validate input data
      if (!Array.isArray(blocklists)) {
        throw new Error('blocklists must be an array');
      }
      if (!type || !['blacklist', 'whitelist'].includes(type)) {
        throw new Error('Invalid type specified');
      }
      
      const response = await api.post(endpoints.blocklists, { blocklists, type });
      
      // Validate response
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error saving blocklists:', error);
      throw new Error(`Failed to save blocklists: ${error.message}`);
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