import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';

// https://vite.dev/config/
export default defineConfig({
	server: {
		hmr: {
			host: 'localhost',
		}
	},
	plugins: [
		devtools(),
		// Make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react-swc' (alias of 'react')
		tanstackRouter({
			target: 'react',
			autoCodeSplitting: true,
		}),
		react(),
		tailwindcss(),
],
});
