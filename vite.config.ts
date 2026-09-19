import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function vendorChunk(id: string): string | undefined {
  if (!id.includes('node_modules')) {
    return undefined
  }

  if (id.includes('@daily-co')) {
    return 'daily'
  }

  if (id.includes('@mui') || id.includes('@emotion') || id.includes('@popperjs')) {
    return 'mui'
  }

  if (id.includes('firebase') || id.includes('@firebase')) {
    return 'firebase'
  }

  if (id.includes('i18next')) {
    return 'i18n'
  }

  if (id.includes('xstate')) {
    return 'xstate'
  }

  if (
    id.includes('react-dom') ||
    id.includes('react-router') ||
    id.includes('/scheduler/') ||
    /[/\\]node_modules[/\\]react[/\\]/.test(id)
  ) {
    return 'react-vendor'
  }

  return undefined
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      external: ['vitest', '@testing-library/react', '@testing-library/jest-dom'],
      output: {
        manualChunks: vendorChunk
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/components/__tests__/setup/index.ts']
  }
}) 