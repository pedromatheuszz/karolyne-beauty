import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos: o app empacotado carrega o index.html por file://,
  // onde referências absolutas (/assets/...) apontariam para a raiz do disco.
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5050,
    host: true,
    open: true,
  },
})
