import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: ['vitest', '@testing-library/react', '@testing-library/jest-dom']
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/components/__tests__/setup/index.ts']
  }
}) 