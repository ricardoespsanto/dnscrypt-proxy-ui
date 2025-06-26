import express from 'express';
import cors from 'cors';
import { config } from '../config/index.ts';
import { validateSettings, validateBlocklists } from '../middleware/validation.ts';
import { apiLimiter, securityMiddleware } from '../middleware/security.ts';
import { formatResponse } from '../utils/response.ts';
import { createError, logger, errorHandler } from '../utils/error.ts';
import SettingsService from './SettingsService.ts';
import MetricsService from './MetricsService.ts';
import FileSystemService from './FileSystemService.ts';
import { exec } from 'child_process';
import { promisify } from 'util';
import LogService from './LogService.ts';

const execAsync = promisify(exec);

const app = express();

// Apply CORS first
app.use(cors(config.server.cors));

// Handle OPTIONS requests
app.options('*', cors(config.server.cors));

// Apply security middleware
app.use(securityMiddleware);

// Apply other middleware
app.use(express.json({ limit: '50mb' }));

// Increase server timeout for all routes
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  req.setTimeout(config.server.timeout);
  res.setTimeout(config.server.timeout);
  next();
});

// Apply rate limiting after other middleware
app.use('/api/', apiLimiter);

// Settings endpoints
app.get('/api/settings', async (req: express.Request, res: express.Response) => {
  try {
    const settings = await SettingsService.read();
    return res.json(formatResponse(settings));
  } catch (error) {
    logger.error('Error reading settings', error);
    return res.status(error.status || 500).json(createError(error.message, error.status, error.details));
  }
});

app.post('/api/settings', validateSettings, async (req: express.Request, res: express.Response) => {
  try {
    const settings = req.body;
    
    // Handle multiline strings for rules
    if (settings.forwarding_rules) {
      settings.forwarding_rules = settings.forwarding_rules.trim();
    }
    if (settings.cloaking_rules) {
      settings.cloaking_rules = settings.cloaking_rules.trim();
    }
    if (settings.blacklist) {
      settings.blacklist = settings.blacklist.trim();
    }
    if (settings.whitelist) {
      settings.whitelist = settings.whitelist.trim();
    }
    
    // Ensure blocklists and whitelist are arrays
    if (!Array.isArray(settings.blocklists)) {
      settings.blocklists = [];
    }
    if (!Array.isArray(settings.whitelist)) {
      settings.whitelist = [];
    }
    
    // Ensure we're not overwriting existing lists when saving the other type
    const currentSettings = await SettingsService.read();
    if (req.body.type === 'whitelist') {
      settings.blocklists = currentSettings.blocklists || [];
    } else if (req.body.type === 'blacklist') {
      settings.whitelist = currentSettings.whitelist || [];
    }
    
    await SettingsService.save(settings);
    return res.json(formatResponse(null, 'Settings saved successfully'));
  } catch (error) {
    logger.error('Error saving settings', error);
    return res.status(error.status || 500).json(createError(error.message, error.status, error.details));
  }
});

// Blocklists endpoints
app.get('/api/blocklists', async (req: express.Request, res: express.Response) => {
  try {
    const settings = await SettingsService.read();
    const { type = 'blacklist' } = req.query;
    
    const list = type === 'whitelist' ? settings.whitelist : settings.blocklists;
    const blocklists = Array.isArray(list) ? list : [];
    
    return res.json(formatResponse({ blocklists }));
  } catch (error) {
    logger.error('Error reading blocklists', error);
    return res.status(error.status || 500).json(createError(error.message, error.status, error.details));
  }
});

app.post('/api/blocklists', validateBlocklists, async (req: express.Request, res: express.Response) => {
  try {
    const settings = await SettingsService.read();
    const { blocklists, type = 'blacklist' } = req.body;
    
    const updatedSettings = {
      ...settings,
      [type === 'whitelist' ? 'whitelist' : 'blocklists']: blocklists || []
    };
    
    if (!Array.isArray(updatedSettings.blocklists)) {
      updatedSettings.blocklists = [];
    }
    if (!Array.isArray(updatedSettings.whitelist)) {
      updatedSettings.whitelist = [];
    }
    
    await SettingsService.save(updatedSettings);
    return res.json(formatResponse(null, `${type} settings saved successfully`));
  } catch (error) {
    logger.error('Error saving blocklists', error);
    return res.status(error.status || 500).json(createError(error.message, error.status, error.details));
  }
});

// Metrics endpoint
app.get('/api/metrics', async (req: express.Request, res: express.Response) => {
  try {
    const metrics = await MetricsService.collect();
    return res.json(formatResponse(metrics));
  } catch (error) {
    logger.error('Error fetching metrics', error);
    return res.status(error.status || 500).json(createError(error.message, error.status, error.details));
  }
});

// Resolvers endpoints
app.get('/api/resolvers', async (req: express.Request, res: express.Response) => {
  try {
    const settings = await SettingsService.read();
    const resolvers = settings.server_names || [];
    const lbStrategy = settings.lb_strategy || 'p2';
    const lbEstimator = settings.lb_estimator !== undefined ? settings.lb_estimator : true;
    const lbEstimatorInterval = settings.lb_estimator_interval || 300;

    return res.json(formatResponse({
      resolvers,
      lb_strategy: lbStrategy,
      lb_estimator: lbEstimator,
      lb_estimator_interval: lbEstimatorInterval
    }));
  } catch (error) {
    logger.error('Error reading resolvers', error);
    return res.status(error.status || 500).json(createError(error.message, error.status, error.details));
  }
});

app.post('/api/resolvers', async (req: express.Request, res: express.Response) => {
  try {
    const settings = await SettingsService.read();
    const { resolvers, lb_strategy, lb_estimator, lb_estimator_interval } = req.body;

    const updatedSettings = {
      ...settings,
      server_names: resolvers || [],
      lb_strategy: lb_strategy || 'p2',
      lb_estimator: lb_estimator !== undefined ? lb_estimator : true,
      lb_estimator_interval: lb_estimator_interval || 300
    };

    await SettingsService.save(updatedSettings);
    return res.json(formatResponse(null, 'Resolvers saved successfully'));
  } catch (error) {
    logger.error('Error saving resolvers', error);
    return res.status(error.status || 500).json(createError(error.message, error.status, error.details));
  }
});

app.post('/api/resolvers/test-latency', async (req: express.Request, res: express.Response) => {
  try {
    const { server, protocol } = req.body;
    if (!server) {
      throw createError('Server address is required', 400);
    }

    // Simulate latency test (replace with actual implementation)
    const latency = Math.floor(Math.random() * 100) + 20; // Random latency between 20-120ms
    return res.json(formatResponse({ latency }));
  } catch (error) {
    logger.error('Error testing resolver latency', error);
    return res.status(error.status || 500).json(createError(error.message, error.status, error.details));
  }
});

// Service endpoints
app.get('/api/service/status', async (req: express.Request, res: express.Response) => {
  try {
    // Check if dnscrypt-proxy service is running
    const { stdout } = await execAsync('systemctl is-active dnscrypt-proxy');
    const status = stdout ? stdout.trim() : 'inactive';
    return res.json(formatResponse({
      status: status === 'active' ? 'running' : 'stopped',
      lastError: null
    }));
  } catch (error) {
    logger.error('Error checking service status', error);
    // Always return stopped if any error occurs, and include the error message
    return res.json(formatResponse({
      status: 'stopped',
      lastError: error.message || null
    }));
  }
});

app.post('/api/service', async (req: express.Request, res: express.Response) => {
  try {
    const { action } = req.body;
    if (!['start', 'stop', 'restart'].includes(action)) {
      throw createError('Invalid action', 400);
    }

    // Execute the service command
    await execAsync(`sudo systemctl ${action} dnscrypt-proxy`);
    
    return res.json(formatResponse(null, `Service ${action}ed successfully`));
  } catch (error) {
    logger.error(`Error ${req.body.action}ing service`, error);
    return res.status(500).json(createError(`Failed to ${req.body.action} service`, 500, error));
  }
});

app.get('/api/service/metrics', async (req: express.Request, res: express.Response) => {
  try {
    const metrics = await MetricsService.collect();
    return res.json(formatResponse(metrics));
  } catch (error) {
    logger.error('Error getting service metrics', error);
    return res.status(error.status || 500).json(createError(error.message, error.status, error.details));
  }
});

// Logs endpoint
app.get('/api/logs', async (req: express.Request, res: express.Response) => {
  try {
    const { limit = 100 } = req.query;
    const logs = await LogService.getLogs(parseInt(limit, 10));
    return res.json(formatResponse(logs || []));
  } catch (error) {
    logger.error('Error fetching logs', error);
    return res.status(500).json(createError('Failed to fetch logs', 500, error));
  }
});

// Apply error handler
app.use(errorHandler);

// Start server
app.listen(config.server.port, () => {
  logger.info(`API server running on http://localhost:${config.server.port}`);
  logger.info('Available endpoints:');
  logger.info('  GET    /api/logs?limit=100');
  logger.info('  DELETE /api/logs');
  logger.info('  GET    /api/settings');
  logger.info('  POST   /api/settings');
  logger.info('  GET    /api/resolvers');
  logger.info('  POST   /api/resolvers');
  logger.info('  GET    /api/blocklists');
  logger.info('  POST   /api/blocklists');
  logger.info('  GET    /api/metrics');
  logger.info('  GET    /api/service/status');
  logger.info('  POST   /api/service');
  logger.info('  GET    /api/service/metrics');
  logger.info('  GET    /api/logs?limit=100');
  logger.info(`Reading logs from: ${config.paths.log}`);
  logger.info(`Reading config from: ${config.paths.config}`);
});