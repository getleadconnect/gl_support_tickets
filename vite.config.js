import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui-vendor': [
                        '@radix-ui/react-alert-dialog',
                        '@radix-ui/react-avatar',
                        '@radix-ui/react-checkbox',
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-popover',
                        '@radix-ui/react-select',
                        '@radix-ui/react-separator',
                        '@radix-ui/react-tabs',
                        '@radix-ui/react-tooltip',
                        '@radix-ui/react-slot',
                        '@radix-ui/react-icons'
                    ],
                    'charts': ['recharts'],
                    'utils': ['axios', 'date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
                    'jquery-plugins': ['jquery', 'select2'],
                },
            },
        },
        chunkSizeWarningLimit: 600, // Increase warning limit to 600kb
        sourcemap: false, // Disable sourcemaps in production for smaller builds
        minify: 'terser', // Use terser for better minification
        terserOptions: {
            compress: {
                drop_console: false, // Keep console logs for debugging
                drop_debugger: true, // Remove debugger statements
            },
        },
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'axios',
            'recharts',
            'date-fns',
            'react-hot-toast',
            'jquery',
            'select2'
        ],
    },
});
