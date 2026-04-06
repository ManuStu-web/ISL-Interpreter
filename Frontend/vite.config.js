import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  optimizeDeps: {
    // exclude: ['@mediapipe/hands'],
  },

  server: {
    headers: {
      // Required for SharedArrayBuffer (used by TF.js WebGL/WASM backends)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },

  build: {
    chunkSizeWarningLimit: 2000, // TF.js bundles are large — suppress noise
    rollupOptions: {
      output: {
        manualChunks: {
          // Split TF.js into its own chunk so the main bundle stays small
          'tfjs': ['@tensorflow/tfjs', '@tensorflow/tfjs-backend-webgl'],
          'hand-pose': ['@tensorflow-models/hand-pose-detection'],
          // React into its own chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})