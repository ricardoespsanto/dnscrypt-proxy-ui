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

// Ensure log file exists
if (!fs.existsSync(LOG_FILE_PATH)) {
  fs.writeFileSync(LOG_FILE_PATH, '', 'utf8');
}

// Function to read logs from file
const readLogs = () => {
  try {
    const content = fs.readFileSync(LOG_FILE_PATH, 'utf8');
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          // Try to parse JSON if the line is in JSON format
          return JSON.parse(line);
        } catch {
          // If not JSON, create a log object from the line
          const timestamp = new Date().toISOString();
          return {
            timestamp,
            level: 'info',
            message: line
          };
        }
      })
      .reverse(); // Most recent logs first
  } catch (error) {
    console.error('Error reading log file:', error);
    return [];
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

// Settings endpoint
app.get('/api/settings', (req, res) => {
  try {
    // For demo purposes, return some sample settings
    const settings = {
      dnsServers: ['1.1.1.1', '8.8.8.8'],
      blockAds: true,
      enableDNSSEC: true,
      logLevel: 'info',
      cacheSize: 1000,
      maxConcurrentQueries: 100
    };
    return res.json(settings);
  } catch (error) {
    console.error('Failed to read settings:', error);
    return res.status(500).json({ error: 'Failed to read settings' });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/logs?limit=100');
  console.log('  DELETE /api/logs');
  console.log('  GET  /api/settings');
  console.log(`Reading logs from: ${LOG_FILE_PATH}`);
});