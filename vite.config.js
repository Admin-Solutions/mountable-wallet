import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
  ],
  define: {
    // Replace process.env.NODE_ENV for browser compatibility
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.jsx'),
      name: 'MountableWallet',
      formats: ['umd', 'es'],
      fileName: (format) => `mountable-wallet.${format}.js`
    },
    rollupOptions: {
      // Bundle React into the output - no external dependencies
      // This increases bundle size but ensures it works standalone
      external: [],
      output: {
        globals: {}
      }
    },
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Minify for production (esbuild is built-in)
    minify: 'esbuild'
  },
  // For dev server
  server: {
    port: 3001
  }
})
