import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls in dev so the browser stays same-origin (no CORS needed)
      "/emails": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
