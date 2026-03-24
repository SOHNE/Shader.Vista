import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import { aliasEngine } from '../alias'

export default defineConfig({
  base: '/play/',
  resolve: {
    alias: aliasEngine,
  },
  plugins: [
    Vue(),
    UnoCSS(),
  ],
  server: {
    fs: {
      allow: ['..'],
    },
  },
  build: {
    outDir: '../docs/dist/play',
    emptyOutDir: true,
  },
})
