import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "admin-rewrite",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/admin" || req.url === "/admin/") {
            req.url = "/backend/admin/index.html";
          } else if (req.url.startsWith("/admin/")) {
            req.url = req.url.replace(/^\/admin\//, "/backend/admin/");
          }
          next();
        });
      },
    },
  ],
  server: {
    proxy: {
      "/backend/api": {
        target: "https://indosmilesouthservices.com",
        changeOrigin: true,
      },
      "/backend/uploads": {
        target: "https://indosmilesouthservices.com",
        changeOrigin: true,
      },
      "/backend/config": {
        target: "https://indosmilesouthservices.com",
        changeOrigin: true,
      },
    },
  },
});
