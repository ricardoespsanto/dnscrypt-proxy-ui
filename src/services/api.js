import axios from 'axios';
import { API_CONFIG } from '../config/defaults';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

export const fetchLogs = async (limit = 100) => {
  try {
    const response = await api.get(`/logs?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
};

export const clearLogs = async () => {
  try {
    const response = await api.delete('/logs');
    return response.data;
  } catch (error) {
    console.error('Error clearing logs:', error);
    throw error;
  }
};

export const getLogLevels = () => {
  return ['info', 'warning', 'error', 'debug'];
};

export const fetchSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

export const saveSettings = async (settings) => {
  try {
    const response = await api.post('/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const fetchResolvers = async () => {
  try {
    const response = await api.get('/resolvers');
    return response.data;
  } catch (error) {
    console.error('Error fetching resolvers:', error);
    throw error;
  }
};

export const saveResolvers = async (resolvers) => {
  try {
    const response = await api.post('/resolvers', resolvers);
    return response.data;
  } catch (error) {
    console.error('Error saving resolvers:', error);
    throw error;
  }
};

export const fetchBlocklists = async () => {
  try {
    const response = await api.get('/blocklists');
    return response.data;
  } catch (error) {
    console.error('Error fetching blocklists:', error);
    throw error;
  }
};

export const saveBlocklists = async (blocklists) => {
  try {
    const response = await api.post('/blocklists', blocklists);
    return response.data;
  } catch (error) {
    console.error('Error saving blocklists:', error);
    throw error;
  }
}; 