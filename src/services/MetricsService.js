import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { config } from '../config/index.js';
import FileSystemService from './FileSystemService.js';
import { createError } from '../utils/error.js';

const execAsync = promisify(exec);

class MetricsService {
  static async collect() {
    try {
      const content = await FileSystemService.readFile(config.paths.log);
      const lines = content.split('\n').filter(line => line.trim());
      
      const metrics = {
        encryptedQueries: 0,
        blockedQueries: 0,
        averageLatency: 0,
        currentResolver: '',
        serviceStatus: 'active',
        lastError: null,
        uptime: 0
      };

      const recentLines = lines.slice(-config.metrics.logLinesToProcess);
      
      // Count encrypted queries
      metrics.encryptedQueries = recentLines.filter(line => 
        line.includes('DNSCrypt') || line.includes('DoH')
      ).length;

      // Count blocked queries
      metrics.blockedQueries = recentLines.filter(line => 
        line.includes('blocked') || line.includes('filtered')
      ).length;

      // Calculate average latency
      const latencyMatches = recentLines
        .map(line => line.match(/latency: (\d+)ms/))
        .filter(match => match)
        .map(match => parseInt(match[1]));
      
      if (latencyMatches.length > 0) {
        metrics.averageLatency = Math.round(
          latencyMatches.reduce((a, b) => a + b, 0) / latencyMatches.length
        );
      }

      // Get current resolver
      const resolverMatch = recentLines
        .reverse()
        .find(line => line.includes('using server'));
      if (resolverMatch) {
        metrics.currentResolver = resolverMatch.split('using server')[1].trim();
      }

      // Check for errors
      const lastError = recentLines
        .reverse()
        .find(line => line.includes('error') || line.includes('failed'));
      if (lastError) {
        metrics.serviceStatus = 'error';
        metrics.lastError = lastError;
      }

      // Calculate uptime
      const startTimeMatch = recentLines
        .find(line => line.includes('Starting dnscrypt-proxy'));
      if (startTimeMatch) {
        const startTime = new Date(startTimeMatch.split('[')[1].split(']')[0]);
        metrics.uptime = Math.floor((Date.now() - startTime.getTime()) / 1000);
      }

      return metrics;
    } catch (error) {
      throw createError('Failed to collect metrics', 500, error);
    }
  }

  static async getSystemMetrics() {
    try {
      const [uptime, memory, cpu] = await Promise.all([
        this.getUptime(),
        this.getMemoryUsage(),
        this.getCpuUsage(),
      ]);

      return {
        uptime,
        memoryUsage: memory,
        cpuUsage: cpu,
        activeConnections: await this.getActiveConnections(),
      };
    } catch (error) {
      throw createError('Failed to get system metrics', 500, error);
    }
  }

  static async getUptime() {
    try {
      const { stdout } = await execAsync('uptime -p');
      return stdout.trim();
    } catch {
      return '0';
    }
  }

  static getMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    return `${Math.round(usedMem / 1024 / 1024)} MB`;
  }

  static async getCpuUsage() {
    try {
      const { stdout } = await execAsync('top -bn1 | grep "Cpu(s)" | awk \'{print $2}\'');
      return `${Math.round(parseFloat(stdout))}%`;
    } catch {
      return '0%';
    }
  }

  static async getActiveConnections() {
    try {
      const { stdout } = await execAsync('netstat -an | grep :53 | grep ESTABLISHED | wc -l');
      return parseInt(stdout.trim());
    } catch {
      return 0;
    }
  }
}

export default MetricsService; 