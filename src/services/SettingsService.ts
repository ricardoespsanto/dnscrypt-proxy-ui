import path from 'path';
import TOML from '@iarna/toml';
import { config } from '../config/index.ts';
import FileSystemService from './FileSystemService.ts';
import { createError } from '../utils/error.ts';

interface Settings {
  [key: string]: any;
  listen_addresses: string[];
  max_clients: number;
  ipv4_servers: boolean;
  ipv6_servers: boolean;
  dnscrypt_servers: boolean;
  doh_servers: boolean;
  require_dnssec: boolean;
  require_nolog: boolean;
  require_nofilter: boolean;
  disabled_server_names: string[];
  fallback_resolvers: string[];
  ignore_system_dns: boolean;
  netprobe_timeout: number;
  log_level: string;
  log_file: string;
  block_ipv6: boolean;
  cache: boolean;
  cache_size: number;
  cache_ttl_min: number;
  cache_ttl_max: number;
  forwarding_rules: string;
  cloaking_rules: string;
  blacklist: string;
  whitelist: string;
  blocklists: string[];
  server_names: string[];
  lb_strategy: string;
  lb_estimator: boolean;
  lb_estimator_interval: number;
}

class SettingsService {
  static async read(): Promise<Settings> {
    try {
      if (!await FileSystemService.exists(config.paths.config)) {
        return this.getDefaultSettings();
      }

      const content = await FileSystemService.readFile(config.paths.config);
      const parsedContent = TOML.parse(content) as Partial<Settings>;
      const settings: Settings = {
        ...this.getDefaultSettings(), // Start with default settings to ensure all properties are present
        ...parsedContent,
      };
      
      // Ensure blocklists is an array
      if (!Array.isArray(settings.blocklists)) {
        settings.blocklists = [];
      }
      // Ensure whitelist is a string
      if (typeof settings.whitelist !== 'string') {
        settings.whitelist = '';
      }

      return settings;
    } catch (error: any) {
      throw createError('Failed to read settings', 500, error);
    }
  }

  static async save(settings: Settings): Promise<boolean> {
    try {
      const tomlContent = TOML.stringify(settings);
      await FileSystemService.ensureDirectory(path.dirname(config.paths.config));
      await FileSystemService.writeFile(config.paths.config, tomlContent);
      return true;
    } catch (error: any) {
      throw createError('Failed to save settings', 500, error);
    }
  }

  static getDefaultSettings(): Settings {
    return {
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
      log_file: '/var/log/dnscrypt-proxy.log',
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
  }
}

export default SettingsService; 