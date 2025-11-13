import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://filmpass-api-c7hbe8acdah0gceb.swedencentral-01.azurewebsites.net/s",
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api/, "")
      }
    }
  }
});
