import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages: macakuaya.github.io/ChessPrototypes/juicy-learn/
  base: '/ChessPrototypes/juicy-learn/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@chess/components': fileURLToPath(new URL('../../shared/chess-components', import.meta.url))
    },
  },
})
