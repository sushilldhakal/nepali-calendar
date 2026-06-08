import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const PATRO_API_TARGET =
  process.env.VITE_PATRO_API_URL ?? "https://84-235-248-118.sslip.io"

export default defineConfig({
  // GitHub Pages serves from /nepali-calendar/ when deployed to
  // https://sushilldhakal.github.io/nepali-calendar/
  base: process.env.GITHUB_PAGES ? "/nepali-calendar/" : "/",
  plugins: [tailwindcss(), react()],
  server: {
    port: 5175,
    proxy: {
      "/health": { target: PATRO_API_TARGET, changeOrigin: true },
      "/patro": { target: PATRO_API_TARGET, changeOrigin: true },
      "/holidays": { target: PATRO_API_TARGET, changeOrigin: true },
      "/festivals": { target: PATRO_API_TARGET, changeOrigin: true },
      "/panchanga": { target: PATRO_API_TARGET, changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
