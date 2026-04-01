import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,      // needed for Docker — exposes to 0.0.0.0 not just localhost
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // outside Docker → localhost 'http://fundflow-bff:8080',  // inside Docker
        changeOrigin: true,
      }
    }
  }
})