import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const PHP_SERVER = "http://localhost:8000";
const PRODUCTION = "https://indosmilesouthservices.com";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // NOTE: /admin is now owned by the React admin (src/pages/admin/*).
      // The legacy PHP admin is being migrated module-by-module; while that is in
      // progress it stays reachable directly at /backend/admin/index.php.
      "/backend/admin": {
        target: PHP_SERVER,
        changeOrigin: true,
      },
      "/backend/api": {
        target: PRODUCTION,
        changeOrigin: true,
      },
      "/backend/uploads": {
        target: PRODUCTION,
        changeOrigin: true,
      },
      "/backend/config": {
        target: PRODUCTION,
        changeOrigin: true,
      },
    },
  },
});
