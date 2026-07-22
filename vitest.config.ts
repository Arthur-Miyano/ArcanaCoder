import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*'],
      exclude: [
        'src/types/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        'public/**',
        'scripts/**',
        '*.config.*',
      ],
      thresholds: {
        lines: 50,
        functions: 35,
        branches: 45,
      },
    },
  },
})
