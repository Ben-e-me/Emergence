/**
 * @file vite.config.mts
 * @description Vite configuration for the Emergence experience.
 * @architecture
 * - Uses the React plugin for JSX and fast refresh.
 * - Keeps config minimal to prioritize fast iteration on the simulation and visuals.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
});

