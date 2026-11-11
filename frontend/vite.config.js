import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Allow cross-origin requests
      "/api": "http://localhost:3000",
    },
  },
  resolve: {
    preserveSymlinks: true,
  },
  cacheDir: path.resolve(import.meta.dirname, "../.vite-cache"), // ES modules have no __dirname
});
