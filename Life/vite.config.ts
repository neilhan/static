import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
// Must match deployment path so assets load when served at .../static/Life/ or .../static/Life/dist/
export default defineConfig({
  plugins: [svelte()],
  base: "/static/Life/dist/",
  server: {
    port: 3002,
    open: true,
  },
})
