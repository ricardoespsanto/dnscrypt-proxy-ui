import axios, { AxiosError, AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
      return Promise.reject({ message: 'Network Error: No response from server' });
    } else {
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API endpoints
const endpoints = {
  logs: '/logs',
  settings: '/settings',
  resolvers: '/resolvers',
  blocklists: '/blocklists',
  metrics: '/metrics',
  service: '/service',
};

// Log related API calls
export const logsApi = {
  fetch: async (): Promise<any> => {
    const response = await api.get(endpoints.logs);
    return response.data;
  },
  getLogs: async (limit: number): Promise<any> => {
    const response = await api.get(`${endpoints.logs}?limit=${limit}`);
    return response.data;
  },
  clear: async (): Promise<any> => {
    const response = await api.delete(endpoints.logs);
    return response.data;
  },
  getLevels: () => ['emerg', 'alert', 'crit', 'error', 'warn', 'notice', 'info', 'debug'],
};

// Settings related API calls
export const settingsApi = {
  fetch: async (): Promise<any> => {
    try {
      const response = await api.get(endpoints.settings);
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching settings:', error);
      throw new Error('Failed to fetch settings');
    }
  },

  save: async (settings: any): Promise<any> => {
    try {
      const response = await api.post(endpoints.settings, settings);
      return response.data;
    } catch (error: unknown) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  },
};

// Resolver related API calls
export const resolversApi = {
  fetch: async (): Promise<any> => {
    try {
      const response = await api.get(endpoints.resolvers);
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching resolvers:', error);
      throw new Error('Failed to fetch resolvers');
    }
  },

  save: async (resolvers: any): Promise<any> => {
    try {
      const response = await api.post(endpoints.resolvers, resolvers);
      return response.data;
    } catch (error: unknown) {
      console.error('Error saving resolvers:', error);
      throw new Error('Failed to save resolvers');
    }
  },
};

// Blocklist related API calls
export const blocklistsApi = {
  fetch: async (type: string = 'blacklist'): Promise<any> => {
    try {
      const response = await api.get(`${endpoints.blocklists}?type=${type}`);
      if (!response.data || typeof response.data !== 'object') {
        throw new Error(`Invalid response format for ${type}`);
      }
      if (!Array.isArray(response.data.blocklists)) {
        response.data.blocklists = [];
      }
      if (!Array.isArray(response.data.whitelist)) {
        response.data.whitelist = [];
      }
      return response.data;
    } catch (error: unknown) {
      console.error(`Error fetching ${type}:`, error);
      throw new Error(`Failed to fetch ${type}: ${(error as Error).message}`);
    }
  },

  save: async (data: { blocklists: string[]; type: string }): Promise<any> => {
    try {
      const { blocklists, type = 'blacklist' } = data;
      if (!Array.isArray(blocklists)) {
        throw new Error('blocklists must be an array');
      }
      if (!type || !['blacklist', 'whitelist'].includes(type)) {
        throw new Error('Invalid type specified');
      }
      const response = await api.post(endpoints.blocklists, { blocklists, type });
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format');
      }
      return response.data;
    } catch (error: unknown) {
      console.error('Error saving blocklists:', error);
      throw new Error(`Failed to save blocklists: ${(error as Error).message}`);
    }
  },
};

// Add metrics API
export const metricsApi = {
  fetch: async (): Promise<any> => {
    try {
      const response = await api.get(endpoints.metrics);
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching metrics:', error);
      throw error as Error;
    }
  }
};

// Add service control API
export const serviceApi = {
  getStatus: async (): Promise<any> => {
    const response = await api.get(`${endpoints.service}/status`);
    return response.data;
  },

  control: async (action: string): Promise<any> => {
    const response = await api.post(endpoints.service, { action });
    return response.data;
  },

  getMetrics: async (): Promise<any> => {
    const response = await api.get(`${endpoints.service}/metrics`);
    return response.data;
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