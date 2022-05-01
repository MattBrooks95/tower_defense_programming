const esbuild = require("esbuild");

const outDir = "build";
const isWatch = process.env.WATCH;
const isDev = process.env.DEV === 'true';

const buildConfig = {
	entryPoints: [
		"index.ts",
	],
	bundle: true,
	outdir: outDir,
	watch: isWatch !== undefined,
	define: {
		isDev
	},
	target: "esnext",
	globalName: isDev ? "game" : undefined,
	sourcemap: isDev ? "linked" : undefined,
};

console.log(buildConfig);

esbuild.build(buildConfig).catch(() => process.exit(1));
