/**
 * @file vitest.config.mts
 * @description Vitest configuration for unit testing the Emergence project.
 * @architecture
 * - Uses jsdom to approximate a browser environment for React hooks and components.
 * - Aligns module resolution with Vite defaults.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['tests/**/*.test.js'],
  },
});

