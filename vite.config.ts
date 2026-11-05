import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works from any sub-path (e.g. GitHub Pages /travel-app/).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // The map engine is big and rarely changes: keep it in its own cacheable file.
        manualChunks: { maplibre: ['maplibre-gl'] },
      },
    },
  },
});
