import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'  // Updated React 19 compatible plugin

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
