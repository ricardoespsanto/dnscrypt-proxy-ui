import { createError } from '../utils/error.js';

export const validateSettings = (req, res, next) => {
  const settings = req.body;
  
  // Validate required fields
  if (!settings.listen_addresses || !Array.isArray(settings.listen_addresses)) {
    return res.status(400).json(createError('listen_addresses must be an array', 400));
  }
  
  // Validate port numbers
  for (const addr of settings.listen_addresses) {
    const [host, port] = addr.split(':');
    if (!port || isNaN(port) || port < 1 || port > 65535) {
      return res.status(400).json(createError(`Invalid port number in ${addr}`, 400));
    }
  }
  
  // Validate numeric fields
  const numericFields = ['max_clients', 'netprobe_timeout', 'cache_size', 'cache_ttl_min', 'cache_ttl_max'];
  for (const field of numericFields) {
    if (settings[field] !== undefined && (isNaN(settings[field]) || settings[field] < 0)) {
      return res.status(400).json(createError(`${field} must be a positive number`, 400));
    }
  }
  
  // Validate boolean fields
  const booleanFields = ['ipv4_servers', 'ipv6_servers', 'dnscrypt_servers', 'doh_servers', 
                        'require_dnssec', 'require_nolog', 'require_nofilter', 'ignore_system_dns',
                        'block_ipv6', 'cache', 'lb_estimator'];
  for (const field of booleanFields) {
    if (settings[field] !== undefined && typeof settings[field] !== 'boolean') {
      return res.status(400).json(createError(`${field} must be a boolean`, 400));
    }
  }
  
  // Validate arrays
  const arrayFields = ['server_names', 'disabled_server_names', 'fallback_resolvers', 'blocklists', 'whitelist'];
  for (const field of arrayFields) {
    if (settings[field] !== undefined && !Array.isArray(settings[field])) {
      return res.status(400).json(createError(`${field} must be an array`, 400));
    }
  }
  
  // Validate strings
  const stringFields = ['log_level', 'log_file', 'forwarding_rules', 'cloaking_rules', 'blacklist', 'whitelist'];
  for (const field of stringFields) {
    if (settings[field] !== undefined && typeof settings[field] !== 'string') {
      return res.status(400).json(createError(`${field} must be a string`, 400));
    }
  }
  
  // Validate log level
  if (settings.log_level && !['emerg', 'alert', 'crit', 'error', 'warn', 'notice', 'info', 'debug'].includes(settings.log_level)) {
    return res.status(400).json(createError('Invalid log level', 400));
  }
  
  // Validate load balancing strategy
  if (settings.lb_strategy && !['p2', 'ph', 'fastest'].includes(settings.lb_strategy)) {
    return res.status(400).json(createError('Invalid load balancing strategy', 400));
  }
  
  next();
};

export const validateBlocklists = (req, res, next) => {
  const { blocklists, type } = req.body;
  
  if (!type || !['blacklist', 'whitelist'].includes(type)) {
    return res.status(400).json(createError('Invalid list type', 400));
  }
  
  if (!Array.isArray(blocklists)) {
    return res.status(400).json(createError('blocklists must be an array', 400));
  }
  
  for (const list of blocklists) {
    if (typeof list !== 'string' || !list.trim()) {
      return res.status(400).json(createError('Each blocklist must be a non-empty string', 400));
    }
  }
  
  next();
}; 