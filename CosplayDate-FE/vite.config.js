import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure assets are loaded from root
  server: {
    // Proxy disabled for production API
    // proxy: {
    //   '/api': {
    //     target: 'https://localhost:7241',
    //     changeOrigin: true,
    //     secure: false, // Set to false if using self-signed certificates
    //     configure: (proxy, options) => {
    //       proxy.on('error', (err, req, res) => {
    //         // console.log('Proxy error:', err);
    //       });
    //       proxy.on('proxyReq', (proxyReq, req, res) => {
    //         // console.log('Proxying request to:', proxyReq.getHeader('host') + proxyReq.path);
    //       });
    //     }
    //   }
    // }
  },
  build: {
    rollupOptions: {
      output: {
        // Disable code splitting to avoid chunk loading issues
        manualChunks: undefined
      }
    }
  }
})
