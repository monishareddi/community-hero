// vite.config.js
// ---------------------------------------------------------------------------
// Vite is the dev server + build tool for our React app.
// The "proxy" section forwards any request starting with /api or /uploads
// to the backend on http://localhost:3001.
//
// Why? It lets the frontend code use simple relative URLs like "/api/issues"
// instead of the full "http://localhost:3001/api/issues", and it avoids
// browser CORS problems during development.
// ---------------------------------------------------------------------------

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
      "/uploads": "http://localhost:3001",
    },
  },
});
