import express from 'express';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Log file path
const LOG_FILE_PATH = path.join(__dirname, '../../logs/dnscrypt-proxy.log');
const CONFIG_FILE_PATH = path.join(__dirname, '../../config/dnscrypt-proxy.toml');

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
        fallback_resolvers: ['9.9.9.9:53', '8.8.8.8:53'],
        ignore_system_dns: false,
        netprobe_timeout: 60,
        log_level: 'info',
        log_file: LOG_FILE_PATH,
        block_ipv6: false,
        cache: true,
        cache_size: 1000,
        cache_ttl_min: 2400,
        cache_ttl_max: 86400,
        forwarding_rules: '',
        cloaking_rules: '',
        blacklist: '',
        whitelist: ''
      };
    }

    const content = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
    // Parse TOML content and convert to our settings format
    // This is a simplified version - you might want to use a TOML parser
    const settings = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=').map(s => s.trim());
        if (key && value) {
          // Convert TOML values to JavaScript values
          if (value === 'true') settings[key] = true;
          else if (value === 'false') settings[key] = false;
          else if (value.startsWith('[') && value.endsWith(']')) {
            settings[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/"/g, ''));
          }
          else if (!isNaN(value)) settings[key] = Number(value);
          else settings[key] = value.replace(/"/g, '');
        }
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
      } else {
        tomlContent += `${key} = "${value}"\n`;
      }
    }

    fs.writeFileSync(CONFIG_FILE_PATH, tomlContent);
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
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
    saveSettings(settings);
    return res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    return res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET    /api/logs?limit=100');
  console.log('  DELETE /api/logs');
  console.log('  GET    /api/settings');
  console.log('  POST   /api/settings');
  console.log(`Reading logs from: ${LOG_FILE_PATH}`);
  console.log(`Reading config from: ${CONFIG_FILE_PATH}`);
});