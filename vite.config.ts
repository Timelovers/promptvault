import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// API keys are entered by each user in the browser. Do not inject secrets at build time.
export default defineConfig({
  plugins: [react()],
  base: './',
});
