export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 5000,
};

export const DEFAULT_SETTINGS = {
  listen_addresses: ['127.0.0.1:53'],
  max_clients: 250,
  ipv4_servers: true,
  ipv6_servers: false,
  dnscrypt_servers: true,
  doh_servers: true,
  require_dnssec: false,
  require_nolog: true,
  require_nofilter: false,
  disabled_server_names: [],
  fallback_resolvers: [
    'cloudflare',
    'google',
    'quad9-dnscrypt-ip4-filter-pri',
    'adguard-dns',
    'mullvad-default-doh'
  ],
  ignore_system_dns: false,
  netprobe_timeout: 60,
  log_level: 'info',
  log_file: import.meta.env.VITE_LOG_FILE || 'logs/dnscrypt-proxy.log',
  block_ipv6: false,
  cache: true,
  cache_size: 1000,
  cache_ttl_min: 2400,
  cache_ttl_max: 86400,
  forwarding_rules: '',
  cloaking_rules: '',
  blacklist: '',
  whitelist: '',
  blocklists: [],
  server_names: [
    'cloudflare',
    'cloudflare-ipv6',
    'cloudflare-security',
    'cloudflare-family',
    'google',
    'google-ipv6',
    'quad9-dnscrypt-ip4-filter-alt',
    'quad9-dnscrypt-ip4-filter-pri',
    'quad9-dnscrypt-ip4-nofilter-alt',
    'quad9-dnscrypt-ip4-nofilter-pri',
    'adguard-dns',
    'adguard-dns-ipv6',
    'adguard-dns-family',
    'adguard-dns-family-ipv6',
    'mullvad-adblock-doh',
    'mullvad-adblock-doh-ipv6',
    'mullvad-default-doh',
    'mullvad-default-doh-ipv6',
    'nextdns',
    'nextdns-ipv6'
  ],
  lb_strategy: 'p2',
  lb_estimator: true,
  lb_estimator_interval: 300
};

export const LOG_LEVELS = [
  'emerg',
  'alert',
  'crit',
  'error',
  'warn',
  'notice',
  'info',
  'debug'
];

export const FILE_PATHS = {
  CONFIG_DIR: import.meta.env.VITE_CONFIG_DIR || 'config',
  LOG_DIR: import.meta.env.VITE_LOG_DIR || 'logs',
  EXAMPLE_CONFIG: 'dnscrypt-proxy.toml.example',
  USER_CONFIG: 'dnscrypt-proxy.toml'
}; 