import express from 'express';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

const execAsync = promisify(exec);

// Log file path
const LOG_FILE_PATH = path.join(__dirname, '../../logs/dnscrypt-proxy.log');
const CONFIG_FILE_PATH = path.join(__dirname, '../../config/dnscrypt-proxy.toml');

// Serve static files from the dist directory in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // In development, serve the index.html from the root
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
  });
}

// Ensure directories exist
const ensureDirectories = () => {
  const dirs = [
    path.dirname(LOG_FILE_PATH),
    path.dirname(CONFIG_FILE_PATH)
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureDirectories();

// Function to read logs from file
const readLogs = () => {
  try {
    const content = fs.readFileSync(LOG_FILE_PATH, 'utf8');
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          const timestamp = new Date().toISOString();
          return {
            timestamp,
            level: 'info',
            message: line
          };
        }
      })
      .reverse();
  } catch (error) {
    console.error('Error reading log file:', error);
    return [];
  }
};

// Function to read settings from TOML file
const readSettings = () => {
  try {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      // Return default settings if config file doesn't exist
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

    const content = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
    const settings = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Skip comments and empty lines
      if (!line.trim() || line.trim().startsWith('#')) continue;
      
      // Split on first equals sign
      const equalIndex = line.indexOf('=');
      if (equalIndex === -1) continue;
      
      const key = line.substring(0, equalIndex).trim();
      let value = line.substring(equalIndex + 1).trim();
      
      // Remove inline comments
      const commentIndex = value.indexOf('#');
      if (commentIndex !== -1) {
        value = value.substring(0, commentIndex).trim();
      }
      
      // Parse value based on type
      if (value === 'true') settings[key] = true;
      else if (value === 'false') settings[key] = false;
      else if (value.startsWith('[') && value.endsWith(']')) {
        // Parse array
        const arrayContent = value.slice(1, -1);
        settings[key] = arrayContent.split(',')
          .map(item => item.trim().replace(/['"]/g, ''));
      }
      else if (value.startsWith("'''") && value.endsWith("'''")) {
        // Parse multiline string
        settings[key] = value.slice(3, -3);
      }
      else if (value.startsWith("'") && value.endsWith("'")) {
        // Parse single-line string
        settings[key] = value.slice(1, -1);
      }
      else if (value.startsWith('"') && value.endsWith('"')) {
        // Parse double-quoted string
        settings[key] = value.slice(1, -1);
      }
      else if (!isNaN(value)) {
        // Parse number
        settings[key] = Number(value);
      }
      else {
        // Default to string
        settings[key] = value;
      }
    }

    return settings;
  } catch (error) {
    console.error('Error reading settings:', error);
    throw error;
  }
};

// Function to save settings to TOML file
const saveSettings = (settings) => {
  try {
    let tomlContent = '# DNSCrypt-Proxy Configuration\n\n';
    
    // Convert settings to TOML format
    for (const [key, value] of Object.entries(settings)) {
      if (Array.isArray(value)) {
        tomlContent += `${key} = [${value.map(v => `"${v}"`).join(', ')}]\n`;
      } else if (typeof value === 'boolean') {
        tomlContent += `${key} = ${value}\n`;
      } else if (typeof value === 'number') {
        tomlContent += `${key} = ${value}\n`;
      } else if (value.includes('\n')) {
        // Handle multiline strings
        tomlContent += `${key} = """\n${value}\n"""\n`;
      } else {
        // Handle single-line strings, ensuring we don't add extra quotes
        const cleanValue = value.replace(/^["']|["']$/g, '');
        tomlContent += `${key} = "${cleanValue}"\n`;
      }
    }

    fs.writeFileSync(CONFIG_FILE_PATH, tomlContent);
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

// Function to read resolvers from TOML file
const readResolvers = () => {
  try {
    const settings = readSettings();
    const serverNames = settings.server_names || [];
    const disabledServerNames = settings.disabled_server_names || [];

    // Create full resolver objects with metadata
    const resolvers = serverNames.map(name => {
      const isDisabled = disabledServerNames.includes(name);
      const protocol = name.includes('doh') ? 'DoH' : 'DNSCrypt';
      const location = name.includes('ipv6') ? 'IPv6' : 'IPv4';
      
      // Determine features based on resolver name
      const features = {
        dnssec: !name.includes('nofilter'),
        noLogs: !name.includes('nolog'),
        noFilter: name.includes('nofilter'),
        family: name.includes('family'),
        adblock: name.includes('adblock'),
        ipv6: location === 'IPv6'
      };

      return {
        name,
        provider: name.split('-')[0].charAt(0).toUpperCase() + name.split('-')[0].slice(1),
        protocol,
        location,
        features,
        latency: '0 ms',
        isFavorite: false,
        enabled: !isDisabled
      };
    });

    return {
      resolvers,
      lb_strategy: settings.lb_strategy || 'p2',
      lb_estimator: settings.lb_estimator !== undefined ? settings.lb_estimator : true,
      lb_estimator_interval: settings.lb_estimator_interval || 300
    };
  } catch (error) {
    console.error('Error reading resolvers:', error);
    throw error;
  }
};

// Function to save resolvers to TOML file
const saveResolvers = (data) => {
  try {
    const settings = readSettings();
    settings.server_names = data.resolvers.map(r => r.name);
    settings.disabled_server_names = data.resolvers
      .filter(r => !r.enabled)
      .map(r => r.name);
    settings.lb_strategy = data.lb_strategy;
    settings.lb_estimator = data.lb_estimator;
    settings.lb_estimator_interval = data.lb_estimator_interval;
    return saveSettings(settings);
  } catch (error) {
    console.error('Error saving resolvers:', error);
    throw error;
  }
};

// Add new function to read metrics from log file
const readMetrics = () => {
  try {
    const content = fs.readFileSync(LOG_FILE_PATH, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // Initialize metrics
    const metrics = {
      encryptedQueries: 0,
      blockedQueries: 0,
      averageLatency: 0,
      currentResolver: '',
      serviceStatus: 'active'
    };

    // Process last 1000 lines for metrics
    const recentLines = lines.slice(-1000);
    
    // Count encrypted queries (DNSCrypt and DoH)
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

    // Check service status
    const lastError = recentLines
      .reverse()
      .find(line => line.includes('error') || line.includes('failed'));
    if (lastError) {
      metrics.serviceStatus = 'error';
    }

    return metrics;
  } catch (error) {
    console.error('Error reading metrics:', error);
    return {
      encryptedQueries: 0,
      blockedQueries: 0,
      averageLatency: 0,
      currentResolver: 'Unknown',
      serviceStatus: 'error'
    };
  }
};

// Logs endpoints
app.get('/api/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = readLogs();
    const filteredLogs = logs.slice(0, limit);
    return res.json(filteredLogs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.delete('/api/logs', (req, res) => {
  try {
    fs.writeFileSync(LOG_FILE_PATH, '', 'utf8');
    return res.json({ message: 'Logs cleared successfully' });
  } catch (error) {
    console.error('Error clearing logs:', error);
    return res.status(500).json({ error: 'Failed to clear logs' });
  }
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
  try {
    const settings = readSettings();
    return res.json(settings);
  } catch (error) {
    console.error('Error reading settings:', error);
    return res.status(500).json({ error: 'Failed to read settings' });
  }
});

app.post('/api/settings', (req, res) => {
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
    
    saveSettings(settings);
    return res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    return res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Add new endpoints for blocklists
app.get('/api/blocklists', (req, res) => {
  try {
    const settings = readSettings();
    const blocklists = settings.blocklists || [];
    return res.json({ blocklists });
  } catch (error) {
    console.error('Error reading blocklists:', error);
    return res.status(500).json({ error: 'Failed to read blocklists' });
  }
});

app.post('/api/blocklists', (req, res) => {
  try {
    const settings = readSettings();
    const { blocklists } = req.body;
    
    // Update blocklist settings
    settings.blocklists = blocklists || [];
    
    saveSettings(settings);
    return res.json({ message: 'Blocklist settings saved successfully' });
  } catch (error) {
    console.error('Error saving blocklists:', error);
    return res.status(500).json({ error: 'Failed to save blocklists' });
  }
});

// Resolvers endpoints
app.get('/api/resolvers', (req, res) => {
  try {
    const resolvers = readResolvers();
    return res.json(resolvers);
  } catch (error) {
    console.error('Error reading resolvers:', error);
    return res.status(500).json({ error: 'Failed to read resolvers' });
  }
});

app.post('/api/resolvers', (req, res) => {
  try {
    const resolvers = req.body;
    saveResolvers(resolvers);
    return res.json({ message: 'Resolvers saved successfully' });
  } catch (error) {
    console.error('Error saving resolvers:', error);
    return res.status(500).json({ error: 'Failed to save resolvers' });
  }
});

// Add new endpoint for metrics
app.get('/api/metrics', (req, res) => {
  try {
    const metrics = readMetrics();
    return res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Function to get system metrics
const getSystemMetrics = async () => {
  try {
    const [uptime, memory, cpu] = await Promise.all([
      getUptime(),
      getMemoryUsage(),
      getCpuUsage(),
    ]);

    return {
      uptime,
      memoryUsage: memory,
      cpuUsage: cpu,
      activeConnections: await getActiveConnections(),
    };
  } catch (error) {
    console.error('Error getting system metrics:', error);
    return {
      uptime: '0',
      memoryUsage: '0 MB',
      cpuUsage: '0%',
      activeConnections: 0,
    };
  }
};

const getUptime = async () => {
  try {
    const { stdout } = await execAsync('uptime -p');
    return stdout.trim();
  } catch {
    return '0';
  }
};

const getMemoryUsage = () => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  return `${Math.round(usedMem / 1024 / 1024)} MB`;
};

const getCpuUsage = async () => {
  try {
    const { stdout } = await execAsync('top -bn1 | grep "Cpu(s)" | awk \'{print $2}\'');
    return `${Math.round(parseFloat(stdout))}%`;
  } catch {
    return '0%';
  }
};

const getActiveConnections = async () => {
  try {
    const { stdout } = await execAsync('netstat -an | grep :53 | grep ESTABLISHED | wc -l');
    return parseInt(stdout.trim());
  } catch {
    return 0;
  }
};

// Function to detect service management system
const detectServiceManager = async () => {
  try {
    // Check for systemd
    await execAsync('systemctl --version');
    return 'systemd';
  } catch {
    try {
      // Check for OpenRC
      await execAsync('rc-status');
      return 'openrc';
    } catch {
      try {
        // Check for SysV init
        await execAsync('service --version');
        return 'sysv';
      } catch {
        // Check for launchd (macOS)
        if (os.platform() === 'darwin') {
          return 'launchd';
        }
        // Default to unknown
        return 'unknown';
      }
    }
  }
};

// Function to get service status based on system
const getServiceStatus = async (serviceManager) => {
  try {
    switch (serviceManager) {
      case 'systemd':
        const { stdout: systemdStatus } = await execAsync('systemctl is-active dnscrypt-proxy');
        return systemdStatus.trim();
      case 'openrc':
        const { stdout: openrcStatus } = await execAsync('rc-service dnscrypt-proxy status');
        return openrcStatus.includes('started') ? 'active' : 'inactive';
      case 'sysv':
        const { stdout: sysvStatus } = await execAsync('service dnscrypt-proxy status');
        return sysvStatus.includes('running') ? 'active' : 'inactive';
      case 'launchd':
        const { stdout: launchdStatus } = await execAsync('launchctl list | grep dnscrypt-proxy');
        return launchdStatus ? 'active' : 'inactive';
      default:
        return 'unknown';
    }
  } catch (error) {
    console.error('Error getting service status:', error);
    return 'unknown';
  }
};

// Function to control service based on system
const controlService = async (serviceManager, action) => {
  try {
    switch (serviceManager) {
      case 'systemd':
        await execAsync(`sudo systemctl ${action} dnscrypt-proxy`);
        break;
      case 'openrc':
        await execAsync(`sudo rc-service dnscrypt-proxy ${action}`);
        break;
      case 'sysv':
        await execAsync(`sudo service dnscrypt-proxy ${action}`);
        break;
      case 'launchd':
        if (action === 'start') {
          await execAsync('sudo launchctl load /Library/LaunchDaemons/dnscrypt-proxy.plist');
        } else if (action === 'stop') {
          await execAsync('sudo launchctl unload /Library/LaunchDaemons/dnscrypt-proxy.plist');
        } else if (action === 'restart') {
          await execAsync('sudo launchctl unload /Library/LaunchDaemons/dnscrypt-proxy.plist');
          await execAsync('sudo launchctl load /Library/LaunchDaemons/dnscrypt-proxy.plist');
        }
        break;
      default:
        throw new Error('Unsupported service manager');
    }
    return true;
  } catch (error) {
    console.error(`Error ${action}ing service:`, error);
    throw error;
  }
};

// Service control endpoints
app.get('/api/service/status', async (req, res) => {
  try {
    const serviceManager = await detectServiceManager();
    const status = await getServiceStatus(serviceManager);
    const metrics = await getSystemMetrics();
    return res.json({ 
      status,
      metrics,
      serviceManager,
      supported: serviceManager !== 'unknown'
    });
  } catch (error) {
    console.error('Error getting service status:', error);
    return res.status(500).json({ error: 'Failed to get service status' });
  }
});

app.post('/api/service', async (req, res) => {
  try {
    const { action } = req.body;
    if (!['start', 'stop', 'restart'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const serviceManager = await detectServiceManager();
    if (serviceManager === 'unknown') {
      return res.status(400).json({ error: 'Unsupported service manager' });
    }

    await controlService(serviceManager, action);
    const status = await getServiceStatus(serviceManager);

    return res.json({
      message: `Service ${action} successful`,
      status,
      serviceManager
    });
  } catch (error) {
    console.error('Error controlling service:', error);
    return res.status(500).json({ error: 'Failed to control service' });
  }
});

app.get('/api/service/metrics', async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    return res.json(metrics);
  } catch (error) {
    console.error('Error getting service metrics:', error);
    return res.status(500).json({ error: 'Failed to get service metrics' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET    /api/logs?limit=100');
  console.log('  DELETE /api/logs');
  console.log('  GET    /api/settings');
  console.log('  POST   /api/settings');
  console.log('  GET    /api/resolvers');
  console.log('  POST   /api/resolvers');
  console.log('  GET    /api/blocklists');
  console.log('  POST   /api/blocklists');
  console.log('  GET    /api/metrics');
  console.log('  GET    /api/service/status');
  console.log('  POST   /api/service');
  console.log('  GET    /api/service/metrics');
  console.log(`Reading logs from: ${LOG_FILE_PATH}`);
  console.log(`Reading config from: ${CONFIG_FILE_PATH}`);
});