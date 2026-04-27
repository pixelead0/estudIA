import { defineConfig } from 'vite';

export default defineConfig({
  // We specify the base for GH Pages if needed, usually './' or the repo name
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
