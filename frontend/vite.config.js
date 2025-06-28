import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ Proxy error:', err.message);
            console.log('Make sure your backend server is running on http://localhost:3002');
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`📤 Proxying ${req.method} ${req.url} → http://localhost:3002${req.url}`);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`📥 Response ${proxyRes.statusCode} for ${req.method} ${req.url}`);
          });
        },
      },
      '/health': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      }
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    // Add any global constants here if needed
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})