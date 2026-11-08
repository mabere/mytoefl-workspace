import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
            'next/navigation': fileURLToPath(new URL('./resources/js/lib/next-navigation.jsx', import.meta.url)),
            'next/link': fileURLToPath(new URL('./resources/js/lib/next-link.jsx', import.meta.url)),
        },
    },
    plugins: [
        react(),
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: false,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
    ],
});
