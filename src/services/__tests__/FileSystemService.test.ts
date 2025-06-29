import FileSystemService from '../FileSystemService.ts';
import fs from 'fs/promises';
import path from 'path';

// Mock fs/promises
jest.mock('fs/promises');

describe('FileSystemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exists', () => {
    it('should return true when file exists', async () => {
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      const result = await FileSystemService.exists('/path/to/file');
      expect(result).toBe(true);
    });

    it('should return false when file does not exist', async () => {
      (fs.access as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
      const result = await FileSystemService.exists('/path/to/file');
      expect(result).toBe(false);
    });
  });

  describe('ensureDirectory', () => {
    it('should create directory if it does not exist', async () => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      await FileSystemService.ensureDirectory('/path/to/dir');
      expect(fs.mkdir).toHaveBeenCalledWith('/path/to/dir', { recursive: true });
    });

    it('should handle errors', async () => {
      (fs.mkdir as jest.Mock).mockRejectedValue(new Error('Failed to create directory'));
      await expect(FileSystemService.ensureDirectory('/path/to/dir'))
        .rejects.toThrow('Failed to create directory');
    });
  });

  describe('readFile', () => {
    it('should read file content', async () => {
      const content = 'file content';
      (fs.readFile as jest.Mock).mockResolvedValue(content);
      const result = await FileSystemService.readFile('/path/to/file');
      expect(result).toBe(content);
    });

    it('should handle file not found', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
      await expect(FileSystemService.readFile('/path/to/file'))
        .rejects.toThrow('File not found');
    });

    it('should handle other errors', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('Read error'));
      await expect(FileSystemService.readFile('/path/to/file'))
        .rejects.toThrow('Failed to read file');
    });
  });

  describe('writeFile', () => {
    it('should write file content', async () => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      await FileSystemService.writeFile('/path/to/file', 'content');
      expect(fs.writeFile).toHaveBeenCalledWith('/path/to/file', 'content', { mode: 0o644 });
    });

    it('should create directory if it does not exist', async () => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      await FileSystemService.writeFile('/path/to/file', 'content');
      expect(fs.mkdir).toHaveBeenCalledWith('/path/to', { recursive: true });
    });

    it('should handle errors', async () => {
      (fs.mkdir as jest.Mock).mockRejectedValue(new Error('Permission denied'));
      await expect(FileSystemService.writeFile('/path/to/file', 'content'))
        .rejects.toThrow('Failed to write file');
    });
  });

  describe('deleteFile', () => {
    it('should delete file', async () => {
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);
      await FileSystemService.deleteFile('/path/to/file');
      expect(fs.unlink).toHaveBeenCalledWith('/path/to/file');
    });

    it('should handle file not found', async () => {
      (fs.unlink as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
      await expect(FileSystemService.deleteFile('/path/to/file'))
        .rejects.toThrow('File not found');
    });

    it('should handle other errors', async () => {
      (fs.unlink as jest.Mock).mockRejectedValue(new Error('Delete error'));
      await expect(FileSystemService.deleteFile('/path/to/file'))
        .rejects.toThrow('Failed to delete file');
    });
  });

  describe('readDir', () => {
    it('should read directory contents', async () => {
      const files = ['file1.txt', 'file2.txt'];
      (fs.readdir as jest.Mock).mockResolvedValue(files);
      const result = await FileSystemService.readDir('/path/to/dir');
      expect(result).toEqual(files);
    });

    it('should handle directory not found', async () => {
      (fs.readdir as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
      await expect(FileSystemService.readDir('/path/to/dir'))
        .rejects.toThrow('Directory not found');
    });

    it('should handle other errors', async () => {
      (fs.readdir as jest.Mock).mockRejectedValue(new Error('Read error'));
      await expect(FileSystemService.readDir('/path/to/dir'))
        .rejects.toThrow('Failed to read directory');
    });
  });

  describe('getStats', () => {
    it('should get file stats', async () => {
      const stats = { size: 1024, mtime: new Date() };
      (fs.stat as jest.Mock).mockResolvedValue(stats);
      const result = await FileSystemService.getStats('/path/to/file');
      expect(result).toEqual(stats);
    });

    it('should handle file not found', async () => {
      (fs.stat as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
      await expect(FileSystemService.getStats('/path/to/file'))
        .rejects.toThrow('File not found');
    });

    it('should handle other errors', async () => {
      (fs.stat as jest.Mock).mockRejectedValue(new Error('Failed to get file stats'));
      await expect(FileSystemService.getStats('/path/to/file'))
        .rejects.toThrow('Failed to get file stats');
    });
  });
});