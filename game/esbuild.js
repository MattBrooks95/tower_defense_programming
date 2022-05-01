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
};

if (isDev) {
	//exposes the game to the global object
	buildConfig.globalName = isDev && "game";
}

console.log(buildConfig);

esbuild.build(buildConfig).catch(() => process.exit(1));
