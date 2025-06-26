import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/index.ts';
import { createError } from '../utils/error.ts';

class LogService {
  static async getLogs(limit: number = 100): Promise<string[]> {
    try {
      const logPath = config.paths.log;
      const logContent = await fs.readFile(logPath, 'utf8');
      if (typeof logContent !== 'string') {
        return [];
      }
      const logs = logContent.split('\n').filter(Boolean).slice(-limit);
      return Array.isArray(logs) ? logs : [];
    } catch (error: any) {
      throw createError('Failed to fetch logs', 500, error);
    }
  }
}

export default LogService; 