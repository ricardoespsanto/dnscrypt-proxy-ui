import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import process from 'process';
import { DEFAULT_SETTINGS, FILE_PATHS } from '../src/config/defaults.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const CONFIG_DIR = path.join(__dirname, '..', FILE_PATHS.CONFIG_DIR);
const EXAMPLE_CONFIG = path.join(CONFIG_DIR, FILE_PATHS.EXAMPLE_CONFIG);
const USER_CONFIG = path.join(CONFIG_DIR, FILE_PATHS.USER_CONFIG);

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Check if user config already exists
if (fs.existsSync(USER_CONFIG)) {
  console.log('Configuration file already exists at:', USER_CONFIG);
  console.log('Please backup and remove it if you want to create a new one.');
  process.exit(0);
}

// Copy example config if it doesn't exist
if (!fs.existsSync(EXAMPLE_CONFIG)) {
  console.error('Example configuration file not found at:', EXAMPLE_CONFIG);
  process.exit(1);
}

// Read example config
const exampleConfig = fs.readFileSync(EXAMPLE_CONFIG, 'utf8');

// Questions for user configuration
const questions = [
  {
    name: 'listen_addresses',
    question: `Enter listen addresses (comma-separated, default: ${DEFAULT_SETTINGS.listen_addresses.join(', ')}): `,
    default: DEFAULT_SETTINGS.listen_addresses.join(', ')
  },
  {
    name: 'max_clients',
    question: `Enter maximum number of clients (default: ${DEFAULT_SETTINGS.max_clients}): `,
    default: DEFAULT_SETTINGS.max_clients.toString()
  },
  {
    name: 'log_level',
    question: `Enter log level (${DEFAULT_SETTINGS.log_level}): `,
    default: DEFAULT_SETTINGS.log_level
  },
  {
    name: 'log_file',
    question: `Enter log file path (default: ${DEFAULT_SETTINGS.log_file}): `,
    default: DEFAULT_SETTINGS.log_file
  },
  {
    name: 'fallback_resolvers',
    question: `Enter fallback resolvers (comma-separated, default: ${DEFAULT_SETTINGS.fallback_resolvers.join(', ')}): `,
    default: DEFAULT_SETTINGS.fallback_resolvers.join(', ')
  }
];

// Process questions
let currentQuestion = 0;
const answers = {};

function askQuestion() {
  if (currentQuestion >= questions.length) {
    // All questions answered, create config file
    let config = exampleConfig;
    
    // Replace values in config
    Object.entries(answers).forEach(([key, value]) => {
      const regex = new RegExp(`${key}\\s*=\\s*[^\\n]+`, 'g');
      if (key === 'listen_addresses' || key === 'fallback_resolvers') {
        const values = value.split(',').map(v => `'${v.trim()}'`).join(', ');
        config = config.replace(regex, `${key} = [${values}]`);
      } else {
        config = config.replace(regex, `${key} = ${value}`);
      }
    });

    // Write config file
    fs.writeFileSync(USER_CONFIG, config);
    console.log('\nConfiguration file created at:', USER_CONFIG);
    console.log('Please review the configuration and modify as needed.');
    rl.close();
    return;
  }

  const q = questions[currentQuestion];
  rl.question(q.question, (answer) => {
    answers[q.name] = answer || q.default;
    currentQuestion++;
    askQuestion();
  });
}

// Start asking questions
console.log('DNSCrypt-Proxy Configuration Setup');
console.log('=================================');
console.log('This script will help you create a basic configuration file.');
console.log('You can modify the settings later through the web interface.\n');
askQuestion(); 