import fs from 'fs/promises';
import path from 'path';
import { createError } from '../../utils/error.js';

export const testFileSystem = {
  async getStats(filePath) {
    try {
      return await fs.stat(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw createError('File not found', 404, error);
      }
      throw createError('Failed to get file stats', 500, error);
    }
  },

  async readDir(dirPath) {
    try {
      return await fs.readdir(dirPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw createError('Directory not found', 404, error);
      }
      throw createError('Failed to read directory', 500, error);
    }
  }
}; 