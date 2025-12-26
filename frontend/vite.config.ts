import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/auth/',
  plugins: [react()],
  worker: {
    format: 'es',
  },
  server: {
    port: 2000, // dev port (npm run dev)
    host: true,
  },
  preview: {
    port: 2173, // preview port (npm run preview)
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
 
