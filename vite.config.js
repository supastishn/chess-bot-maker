import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      // For browsers, we need to polyfill these
      target: 'es2020',
      define: {
        global: 'globalThis'
      },
      supported: { 
        bigint: true 
      },
    }
  }
})
