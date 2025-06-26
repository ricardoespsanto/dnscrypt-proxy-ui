import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/index.js';
import { createError } from '../utils/error.js';

class LogService {
  static async getLogs(limit = 100) {
    try {
      const logPath = config.paths.log;
      const logContent = await fs.readFile(logPath, 'utf8');
      if (typeof logContent !== 'string') {
        return [];
      }
      const logs = logContent.split('\n').filter(Boolean).slice(-limit);
      return Array.isArray(logs) ? logs : [];
    } catch (error) {
      throw createError('Failed to fetch logs', 500, error);
    }
  }
}

export default LogService; 