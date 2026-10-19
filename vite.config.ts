import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const apiTarget = process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:3000';

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
        port: Number(process.env.VITE_PORT ?? 5173),
        strictPort: true,
        proxy: {
            '/v1': apiTarget,
            '/download': apiTarget,
            '/health': apiTarget,
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
