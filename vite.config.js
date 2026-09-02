import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo1.png"],
      manifest: {
        name: "Healthcare AI Communication Assistant",
        short_name: "HealthAI",
        description: "AI-Powered Healthcare Communication Assistant for Rural Communities",
        theme_color: "#2F6F5E",
        background_color: "#faf8f2",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "logo1.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logo1.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,
    open: true,
    proxy: {
      // All API traffic → server1.py master backend on :8000
      "/api/v1": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});