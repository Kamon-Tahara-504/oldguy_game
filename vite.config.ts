import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/oldguy_game/', // GitHub Pages用のbaseパス（リポジトリ名に合わせて変更してください）
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})

