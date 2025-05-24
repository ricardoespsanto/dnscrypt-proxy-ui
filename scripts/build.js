import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Build frontend
console.log('Building frontend...');
execSync('vite build', { stdio: 'inherit' });

// Create dist directory if it doesn't exist
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy backend files to dist
console.log('Copying backend files...');
const backendFiles = [
  'src/services/Server.js',
  'src/config/defaults.js',
  'package.json',
  'package-lock.json'
];

backendFiles.forEach(file => {
  const sourcePath = path.join(rootDir, file);
  const targetPath = path.join(distDir, file);
  const targetDir = path.dirname(targetPath);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  fs.copyFileSync(sourcePath, targetPath);
});

// Create start script
const startScript = `#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set production environment
process.env.NODE_ENV = 'production';

// Start the server
const server = spawn('node', ['src/services/Server.js'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

// Handle server process
server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  server.kill();
  process.exit();
});
`;

fs.writeFileSync(path.join(distDir, 'start.js'), startScript);

// Update package.json in dist
const packageJson = JSON.parse(fs.readFileSync(path.join(distDir, 'package.json'), 'utf8'));
packageJson.scripts = {
  start: 'node start.js'
};
fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(packageJson, null, 2));

console.log('Build complete!');
console.log('To run the application:');
console.log('1. cd dist');
console.log('2. npm install --production');
console.log('3. npm start'); 