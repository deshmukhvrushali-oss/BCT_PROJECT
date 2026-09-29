import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
server: {
  port: 5173
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
