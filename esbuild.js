const esbuild = require("esbuild");
const sveltePlugin = require("esbuild-svelte");
const sveltePreprocess = require("svelte-preprocess");

const outDir = "build";
const isWatch = process.env.WATCH;
const isDev = process.env.DEV === 'true';

esbuild.build({
	entryPoints: [
		"src/game/main.ts",
		//"src/app.ts",
	],
	bundle: true,
	outdir: outDir,
	plugins: [
		sveltePlugin({
			preprocess: sveltePreprocess()
		}),
	],
	watch: isWatch !== undefined,
	define: {
		isDev
	}
}).catch(() => process.exit(1));
