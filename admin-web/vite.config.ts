import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          configure: (proxy) => {
            // Remove Vite's default error logger to prevent terminal spam
            // when backend is not running (frontend gracefully falls back to local data)
            proxy.removeAllListeners('error');
            proxy.on('error', (_err, _req, res) => {
              if (res && 'writeHead' in res && !(res as any).headersSent) {
                (res as any).writeHead(502, { 'Content-Type': 'application/json' });
                (res as any).end(JSON.stringify({ code: 502, message: 'Backend unavailable' }));
              }
            });
          },
        },
      },
    },
  };
});
