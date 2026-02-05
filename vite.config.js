export default {
  root: '.',
  publicDir: 'public',
  base: './',  // Use relative paths for GitHub Pages
  build: {
    outDir: 'dist'
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  }
}
