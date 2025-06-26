import path from 'path';
import TOML from '@iarna/toml';
import { config } from '../config/index.js';
import FileSystemService from './FileSystemService.js';
import { createError } from '../utils/error.js';

class SettingsService {
  static async read() {
    try {
      if (!await FileSystemService.exists(config.paths.config)) {
        return this.getDefaultSettings();
      }

      const content = await FileSystemService.readFile(config.paths.config);
      const settings = TOML.parse(content);
      
      // Ensure blocklists and whitelist are arrays
      if (!Array.isArray(settings.blocklists)) {
        settings.blocklists = [];
      }
      if (!Array.isArray(settings.whitelist)) {
        settings.whitelist = [];
      }

      return settings;
    } catch (error) {
      throw createError('Failed to read settings', 500, error);
    }
  }

  static async save(settings) {
    try {
      const tomlContent = TOML.stringify(settings);
      await FileSystemService.ensureDirectory(path.dirname(config.paths.config));
      await FileSystemService.writeFile(config.paths.config, tomlContent);
      return true;
    } catch (error) {
      throw createError('Failed to save settings', 500, error);
    }
  }

  static getDefaultSettings() {
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