import { defineConfig } from 'vite'
import dotenv from 'dotenv';
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  dotenv.config();
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr(),],
  define: {
    'process.env': process.env
  },
  optimizeDeps: {
    include: ['jsx-dep']
  }
});

