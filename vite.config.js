import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      bootstrap: path.resolve(__dirname, 'node_modules/bootstrap'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
