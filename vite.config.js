import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: false
    }
  },
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
    ],
    exclude: ['@mui/material/colors'],
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'top-level-await': true,
      },
      define: {
        global: 'globalThis'
      }
    }
  },
  define: {
    'process.env': {
      VITE_API_URL: JSON.stringify('http://localhost:3000'),
      VITE_LOG_FILE: JSON.stringify(path.join(__dirname, 'logs/dnscrypt-proxy.log')),
      VITE_CONFIG_DIR: JSON.stringify(path.join(__dirname, 'config')),
      VITE_LOG_DIR: JSON.stringify(path.join(__dirname, 'logs')),
    },
    global: 'globalThis'
  }
})
