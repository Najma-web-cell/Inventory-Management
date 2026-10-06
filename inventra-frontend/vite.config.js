import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Dev proxy: the browser talks to :5173 and Vite forwards API/image requests to the backend (no CORS issues)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
})
