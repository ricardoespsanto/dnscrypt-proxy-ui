import fs from 'fs/promises';
import path from 'path';
import { createError } from '../utils/error.ts';
import { Stats } from 'fs';

class FileSystemService {
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async ensureDirectory(dirPath: string): Promise<boolean> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      return true;
    } catch (error: any) {
      throw createError('Failed to create directory', 500, error);
    }
  }

  static async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw createError('File not found', 404, error);
      }
      throw createError('Failed to read file', 500, error);
    }
  }

  static async writeFile(filePath: string, content: string): Promise<boolean> {
    try {
      const dir = path.dirname(filePath);
      await this.ensureDirectory(dir);
      await fs.writeFile(filePath, content, { mode: 0o644 });
      return true;
    } catch (error: any) {
      throw createError('Failed to write file', 500, error);
    }
  }

  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw createError('File not found', 404, error);
      }
      throw createError('Failed to delete file', 500, error);
    }
  }

  static async readDir(dirPath: string): Promise<string[]> {
    try {
      return await fs.readdir(dirPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw createError('Directory not found', 404, error);
      }
      throw createError('Failed to read directory', 500, error);
    }
  }

  static async getStats(filePath: string): Promise<Stats> {
    try {
      return await fs.stat(filePath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw createError('File not found', 404, error);
      }
      throw createError('Failed to get file stats', 500, error);
    }
  }
}

export default FileSystemService; 