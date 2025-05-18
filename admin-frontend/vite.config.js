import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    port: 5174,
    // host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:8080/api'),
    'import.meta.env.BASE_URL': JSON.stringify('/')
  }
}) 