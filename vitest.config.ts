import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
        exclude: ['node_modules', 'e2e'],
        setupFiles: ['./vitest.setup.ts'],
    }
})