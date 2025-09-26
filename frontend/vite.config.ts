import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
    server: {
    host: "0.0.0.0", // listen on all network interfaces
    port: 5173,      // or any free port
  },
});
