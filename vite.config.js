import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Expose to your local network so your phone can access it
    host: true,
    port: 5173,
  },
});