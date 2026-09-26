import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    css: {
        preprocessorOptions: {
            scss: { loadPaths: [fileURLToPath(new URL('./src/shared/styles', import.meta.url))] },
        },
    },
    server: {
        port: 5173,
        strictPort: true,
        proxy: {
            '/v1': 'http://127.0.0.1:3000',
            '/download': 'http://127.0.0.1:3000',
            '/health': 'http://127.0.0.1:3000',
        },
    },
    build: {
        sourcemap: false,
        rollupOptions: {
            input: {
                main: fileURLToPath(new URL('./index.html', import.meta.url)),
                legal: fileURLToPath(new URL('./legal/index.html', import.meta.url)),
            },
        },
    },
});
