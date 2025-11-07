import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test file patterns - tests live at root level in __tests__
    include: ['__tests__/**/*.test.ts'],

    // Enable globals (describe, it, expect, etc.)
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['**/dist/**', '**/node_modules/**'],
    },

    // Environment
    environment: 'node',
  },
});
