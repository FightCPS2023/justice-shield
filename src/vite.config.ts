import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist', // Explicitly set output directory
    emptyOutDir: true, // Clean the output directory before build
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb (from default 500kb)
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor code into separate chunks for better caching
          if (id.includes('node_modules')) {
            // React core libraries
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // UI libraries
            if (id.includes('lucide-react') || id.includes('recharts')) {
              return 'ui-vendor';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // Animation libraries
            if (id.includes('motion')) {
              return 'motion-vendor';
            }
            // Other vendors
            return 'vendor';
          }
          // Split large component groups
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
          if (id.includes('/components/')) {
            return 'app-components';
          }
        },
      },
    },
  },
})