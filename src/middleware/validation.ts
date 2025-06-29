import pkg from 'express';
const { Request, Response, NextFunction } = pkg;
import { createError } from '../utils/error.ts';

export const validateSettings = (req: Request, res: Response, next: NextFunction): void => {
  const settings = req.body;
  
  // Validate required fields
  if (!settings.listen_addresses || !Array.isArray(settings.listen_addresses)) {
    res.status(400).json(createError('listen_addresses must be an array', 400));
    return;
  }
  
  // Validate port numbers
  for (const addr of settings.listen_addresses) {
    const [host, portStr] = addr.split(':');
    const port = parseInt(portStr, 10);
    if (!portStr || isNaN(port) || port < 1 || port > 65535) {
      res.status(400).json(createError(`Invalid port number in ${addr}`, 400));
      return;
    }
  }
  
  // Validate numeric fields
  const numericFields = ['max_clients', 'netprobe_timeout', 'cache_size', 'cache_ttl_min', 'cache_ttl_max'];
  for (const field of numericFields) {
    if (settings[field] !== undefined && (isNaN(settings[field]) || settings[field] < 0)) {
      res.status(400).json(createError(`${field} must be a positive number`, 400));
      return;
    }
  }
  
  // Validate boolean fields
  const booleanFields = ['ipv4_servers', 'ipv6_servers', 'dnscrypt_servers', 'doh_servers', 
                        'require_dnssec', 'require_nolog', 'require_nofilter', 'ignore_system_dns',
                        'block_ipv6', 'cache', 'lb_estimator'];
  for (const field of booleanFields) {
    if (settings[field] !== undefined && typeof settings[field] !== 'boolean') {
      res.status(400).json(createError(`${field} must be a boolean`, 400));
      return;
    }
  }
  
  // Validate arrays
  const arrayFields = ['server_names', 'disabled_server_names', 'fallback_resolvers', 'blocklists', 'whitelist'];
  for (const field of arrayFields) {
    if (settings[field] !== undefined && !Array.isArray(settings[field])) {
      res.status(400).json(createError(`${field} must be an array`, 400));
      return;
    }
  }
  
  // Validate strings
  const stringFields = ['log_level', 'log_file', 'forwarding_rules', 'cloaking_rules', 'blacklist', 'whitelist'];
  for (const field of stringFields) {
    if (settings[field] !== undefined && typeof settings[field] !== 'string') {
      res.status(400).json(createError(`${field} must be a string`, 400));
      return;
    }
  }
  
  // Validate log level
  if (settings.log_level && !['emerg', 'alert', 'crit', 'error', 'warn', 'notice', 'info', 'debug'].includes(settings.log_level)) {
    res.status(400).json(createError('Invalid log level', 400));
    return;
  }
  
  // Validate load balancing strategy
  if (settings.lb_strategy && !['p2', 'ph', 'fastest'].includes(settings.lb_strategy)) {
    res.status(400).json(createError('Invalid load balancing strategy', 400));
    return;
  }
  
  next();
};

export const validateBlocklists = (req: Request, res: Response, next: NextFunction): void => {
  const { blocklists, type } = req.body;
  
  if (!type || !['blacklist', 'whitelist'].includes(type)) {
    res.status(400).json(createError('Invalid list type', 400));
    return;
  }
  
  if (!Array.isArray(blocklists)) {
    res.status(400).json(createError('blocklists must be an array', 400));
    return;
  }
  
  for (const list of blocklists) {
    if (typeof list !== 'string' || !list.trim()) {
      res.status(400).json(createError('Each blocklist must be a non-empty string', 400));
      return;
    }
  }
  
  next();
}; 