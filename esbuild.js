const esbuild = require("esbuild");
const sveltePlugin = require("esbuild-svelte");
const sveltePreprocess = require("svelte-preprocess");

const outDir = "build";
const isWatch = process.env.WATCH;

esbuild.build({
	entryPoints: [
		"src/game/main.ts",
		"src/app.ts",
	],
	bundle: true,
	outdir: outDir,
	plugins: [
		sveltePlugin({
			preprocess: sveltePreprocess()
		}),
	],
	watch: isWatch !== undefined
}).catch(() => process.exit(1));
