import * as fs from 'fs';
import path from 'path';
import { createError } from '../../utils/error.ts';

export const testFileSystem = {
  async getStats(filePath: string): Promise<fs.Stats> {
    try {
      return await fs.promises.stat(filePath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw createError('File not found', 404, error);
      }
      throw createError('Failed to get file stats', 500, error);
    }
  },

  async readDir(dirPath: string): Promise<string[]> {
    try {
      return await fs.promises.readdir(dirPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw createError('Directory not found', 404, error);
      }
      throw createError('Failed to read directory', 500, error);
    }
  }
}; 