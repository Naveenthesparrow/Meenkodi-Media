import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',  // Explicitly set base path
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
    // Add fallback for SPA routing
    historyApiFallback: true
  },
  build: {
    // Ensure proper asset handling
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-router')) return 'router-vendor';
          if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
          if (id.includes('@mui')) return 'mui-vendor';
          if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n-vendor';
          if (id.includes('lucide-react')) return 'icons-vendor';
          if (id.includes('swiper')) return 'swiper-vendor';
          return 'vendor';
        }
      }
    }
  }
})
