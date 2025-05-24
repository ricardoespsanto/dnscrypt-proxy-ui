import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Adjust this to match your API endpoint

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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