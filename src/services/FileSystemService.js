import fs from 'fs/promises';
import path from 'path';
import { createError } from '../utils/error.js';

class FileSystemService {
  static async exists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      return true;
    } catch (error) {
      throw createError('Failed to create directory', 500, error);
    }
  }

  static async readFile(filePath) {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw createError('File not found', 404, error);
      }
      throw createError('Failed to read file', 500, error);
    }
  }

  static async writeFile(filePath, content) {
    try {
      const dir = path.dirname(filePath);
      await this.ensureDirectory(dir);
      await fs.writeFile(filePath, content, { mode: 0o644 });
      return true;
    } catch (error) {
      throw createError('Failed to write file', 500, error);
    }
  }

  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw createError('File not found', 404, error);
      }
      throw createError('Failed to delete file', 500, error);
    }
  }
}

export default FileSystemService; 