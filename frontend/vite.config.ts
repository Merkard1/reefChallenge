import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      Components: path.resolve(__dirname, "./src/components"),
      Assets: path.resolve(__dirname, "./src/assets"),
    },
  },
  server: {
    proxy: {
      '/graphql': {
        target: 'http://localhost:4444',
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), tsconfigPaths()],
});
