const esbuild = require("esbuild");
const esbuildSvelte = require("esbuild-svelte");
const sveltePreprocess = require("svelte-preprocess");

const outDir = "build";
const isWatch = process.env.WATCH;
const isDev = process.env.DEV === 'true';

const buildConfig = {
	entryPoints: [
		"src/app.ts",
	],
	mainFields: ["svelte", "browser", "module", "main"],
	bundle: true,
	outdir: outDir,
	plugins: [
		esbuildSvelte({
			preprocess: sveltePreprocess()
		}),
	],
	watch: isWatch !== undefined,
	define: {
		isDev
	}
};

console.log(buildConfig);

esbuild.build(buildConfig).catch(() => process.exit(1));
