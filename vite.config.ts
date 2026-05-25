import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/acg-accounting/',
  server: {
    port: 8100,
  },
})
