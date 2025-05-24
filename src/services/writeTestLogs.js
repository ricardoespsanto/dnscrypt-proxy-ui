import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE_PATH = path.join(__dirname, '../../logs/dnscrypt-proxy.log');

const levels = ['info', 'warning', 'error', 'debug'];
const messages = [
  'DNS query received for example.com',
  'Resolver connection established',
  'Failed to resolve domain',
  'Cache hit for frequently accessed domain',
  'Blocked ad request',
  'DNSSEC validation successful',
  'Rate limit exceeded',
  'New resolver added to pool'
];

const writeLog = () => {
  const level = levels[Math.floor(Math.random() * levels.length)];
  const message = messages[Math.floor(Math.random() * messages.length)];
  const timestamp = new Date().toISOString();
  const logEntry = JSON.stringify({ timestamp, level, message }) + '\n';
  
  fs.appendFileSync(LOG_FILE_PATH, logEntry);
};

// Write a log every 2 seconds
setInterval(writeLog, 2000);

console.log(`Writing test logs to: ${LOG_FILE_PATH}`);
console.log('Press Ctrl+C to stop'); 