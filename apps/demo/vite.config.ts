import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  // GitHub Pages serves from /nepali-calendar/ when deployed to
  // https://sushilldhakal.github.io/nepali-calendar/
  base: process.env.GITHUB_PAGES ? "/nepali-calendar/" : "/",
  plugins: [tailwindcss(), react()],
  server: { port: 5175 },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
