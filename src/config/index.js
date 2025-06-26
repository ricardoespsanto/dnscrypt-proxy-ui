import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  server: {
    port: process.env.PORT || 3000,
    timeout: 30000, // 30 seconds
    cors: {
      origin: true, // Allow all origins in development
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      exposedHeaders: ['Content-Length', 'X-Requested-With'],
      credentials: true,
      maxAge: 86400, // 24 hours
      preflightContinue: false,
      optionsSuccessStatus: 204
    }
  },
  paths: {
    log: import.meta.env.VITE_LOG_PATH || path.join(__dirname, '../../logs/dnscrypt-proxy.log'),
    config: import.meta.env.VITE_CONFIG_PATH || path.join(__dirname, '../../config/dnscrypt-proxy.toml')
  },
  metrics: {
    logLinesToProcess: 1000,
    latencyTestTimeout: 5000
  },
  validation: {
    settings: {
      max_clients: { min: 1, max: 1000 },
      netprobe_timeout: { min: 1, max: 300 },
      cache_size: { min: 0, max: 10000 },
      cache_ttl_min: { min: 0, max: 86400 },
      cache_ttl_max: { min: 0, max: 86400 }
    }
  }
}; 