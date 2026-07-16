import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const PRODUCTION = "https://indosmilesouthservices.com";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // /admin is the React admin (src/pages/admin/*). The old PHP admin is gone.
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
