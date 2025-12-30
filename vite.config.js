import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		esbuildOptions: {
			/**
			 * TODO: remove this when the default esbuild target has been raised to support top-level await.
			 * https://github.com/vitejs/vite/blob/v4.4.9/packages/vite/src/node/constants.ts#L20
			 * https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts#L20
			 * https://caniuse.com/mdn-javascript_operators_await_top_level
			 */
			//target: [ "chrome100", "firefox100", "safari15" ],
		},
	},
});
