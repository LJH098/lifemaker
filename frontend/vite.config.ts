import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis"
  },
  resolve: {
    alias: {
      stompjs: "stompjs/lib/stomp.js"
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis"
      }
    }
  },
  server: {
    port: 5173
  }
});
