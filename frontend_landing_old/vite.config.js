import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 2000, // dev port (npm run dev)
    host: true, // allow external access
  },
  preview: {
    port: 2173, // preview port (npm run preview) - production
    host: true, // allow external access
    allowedHosts: ['app.bhaobhao.in', 'localhost', '127.0.0.1'], // allow domain access
  },
})
