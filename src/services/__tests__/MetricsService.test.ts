import MetricsService from '../MetricsService.ts';
import { exec } from 'child_process';
import os from 'os';

// Mock child_process.exec
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

// Mock os module
jest.mock('os', () => ({
  totalmem: jest.fn(),
  freemem: jest.fn()
}));

describe('MetricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('collect', () => {
    it('should collect all metrics', async () => {
      // Mock exec responses
      (exec as jest.Mock).mockImplementation((cmd: string, callback: (error: Error | null, result: { stdout: string }) => void) => {
        if (cmd.includes('uptime')) {
          callback(null, { stdout: 'up 2 hours, 30 minutes' });
        } else if (cmd.includes('top')) {
          callback(null, { stdout: '25.5' });
        } else if (cmd.includes('netstat')) {
          callback(null, { stdout: '5' });
        }
      });

      // Mock os responses
      (os.totalmem as jest.Mock).mockReturnValue(16 * 1024 * 1024 * 1024); // 16GB
      (os.freemem as jest.Mock).mockReturnValue(8 * 1024 * 1024 * 1024); // 8GB

      const metrics = await MetricsService.collect();

      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('cpuUsage');
      expect(metrics).toHaveProperty('activeConnections');
      expect(metrics).toHaveProperty('timestamp');
    });

    it('should handle errors gracefully', async () => {
      (exec as jest.Mock).mockImplementation((cmd: string, callback: (error: Error | null, result: { stdout: string }) => void) => {
        callback(new Error('Command failed'));
      });

      const metrics = await MetricsService.collect();

      expect(metrics.uptime).toBe('0');
      expect(metrics.cpuUsage).toBe('0%');
      expect(metrics.activeConnections).toBe(0);
    });
  });

  describe('getMemoryUsage', () => {
    it('should calculate memory usage correctly', () => {
      (os.totalmem as jest.Mock).mockReturnValue(16 * 1024 * 1024 * 1024); // 16GB
      (os.freemem as jest.Mock).mockReturnValue(8 * 1024 * 1024 * 1024); // 8GB

      const memoryUsage = MetricsService.getMemoryUsage();
      expect(memoryUsage).toBe('8192 MB');
    });
  });
}); 