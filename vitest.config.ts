/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    },
    testTimeout: 10000,
    environmentOptions: {
      jsdom: {
        resources: 'usable'
      },
      NODE_ENV: 'test'
    }
  }
})
