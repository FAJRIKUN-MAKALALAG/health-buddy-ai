import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import VitePluginSitemap  from 'vite-plugin-sitemap'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["final.klabatdev.my.id"],
  },
  preview: {
    host: true,
    allowedHosts: ["final.klabatdev.my.id"],
  },
  plugins: [react(), mode === "development" && componentTagger(), VitePluginSitemap({
      hostname: 'https://final.klabatdev.my.id',
      outDir: "dist",
      readable: true,
    }),].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
