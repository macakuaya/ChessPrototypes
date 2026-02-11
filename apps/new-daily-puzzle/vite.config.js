import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages: macakuaya.github.io/ChessPrototypes/new-daily-puzzle/
  base: '/ChessPrototypes/new-daily-puzzle/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@chess/components': fileURLToPath(new URL('../../shared/chess-components', import.meta.url)),
      // Ensure shared components resolve design-system from this app's node_modules
      '@chesscom/design-system': fileURLToPath(new URL('./node_modules/@chesscom/design-system', import.meta.url))
    },
  },
})
