import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
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
})
