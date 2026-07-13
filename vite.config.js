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
      // Admin panel is PHP (index.php + partials/modals), so it is served by the
      // PHP built-in server started via `npm run dev:php`.
      "/admin": {
        target: PHP_SERVER,
        changeOrigin: true,
        rewrite: (path) =>
          /^\/admin\/?(\?|$)/.test(path)
            ? path.replace(/^\/admin\/?/, "/backend/admin/index.php")
            : path.replace(/^\/admin\//, "/backend/admin/"),
      },
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
