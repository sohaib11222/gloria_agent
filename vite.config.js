import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Use /agent/ base path in production, empty in development
  const base = mode === 'production' ? '/agent/' : '/'
  
  return {
    base,
    plugins: [react(),
    tailwindcss(),
    ],
    resolve: {
      alias: {
        // Allow importing SDK from relative path
      },
    },
    optimizeDeps: {
      exclude: [], // Don't exclude SDK, let Vite handle it
    },
    server: {
      proxy: {
        // Proxy specific /docs API endpoints only (agent, source, admin)
        // This avoids intercepting /docs-fullscreen routes
        '^/docs/(agent|source|admin|proto)': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path, // Keep the path as-is
        },
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
