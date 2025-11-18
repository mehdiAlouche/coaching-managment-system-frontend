import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import  TanStackRouter  from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    react(),
    TanStackRouter(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  css: {
    postcss: './postcss.config.mjs',
  },
})

