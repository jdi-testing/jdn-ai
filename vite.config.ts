import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: './index.html',
        app: './app.html',
        contentScript: 'src/pageServices/contentScripts/index.ts'
      }
    },
    outDir: 'out',
  },
  plugins: [
    react(),
  ]
});