import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import commonjs from 'vite-plugin-commonjs'

export default defineConfig({
  plugins: [
    react(),
    commonjs()
  ],
  build: {
    minify: false,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  esbuild: {
    drop: [],
    pure: [],
  },
  optimizeDeps: {
    include: ['chessground'],
    esbuildOptions: {
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
