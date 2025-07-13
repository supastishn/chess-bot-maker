import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'  // Updated React 19 compatible plugin

export default defineConfig({
  plugins: [react()],
  build: {
    minify: false, // Disable minification to preserve logs
  },
  esbuild: {
    drop: [], // Ensure esbuild doesn't drop console calls
    pure: [],
  },
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
      legalComments: 'inline',
      keepNames: true,
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    }
  }
})
