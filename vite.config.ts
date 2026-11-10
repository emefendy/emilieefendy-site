import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // keep component and hook names through minification so React DevTools shows IntroDialog, not Gh
  esbuild: { keepNames: true },
  // source maps are public on purpose: the code is meant to be read
  build: { target: 'es2022', sourcemap: true },
  worker: { format: 'es' },
});
