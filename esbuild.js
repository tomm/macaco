const fs = require("fs");
const esbuild = require("esbuild");
const timestamp = Date.now();
const platform_node_config = {
    bundle: true,
    platform: "node",
    target: "node12",
    sourcemap: true,
    external: ["axios", "postgres", "uuid", "./node_modules/*"],
};

fs.writeFileSync(
    "./public/index.html",
    `<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<title>macaco</title>
		<meta name="viewport" content="width=device-width,initial-scale=1">
		<script defer="defer" src="${timestamp}.js"></script>
		<link rel="stylesheet" href="${timestamp}.css" type='text/css' media="all" />
	</head>
	<body></body>
</html>`,
);

Promise.all([
    esbuild.build({
        entryPoints: ["src/backend/main.ts"],
        outfile: "./dist/server.js",
        ...platform_node_config,
    }),
    esbuild.build({
        entryPoints: ["src/backend/macaco_cli.ts"],
        outfile: "./dist/cli.js",
        ...platform_node_config,
    }),
    esbuild.build({
        entryPoints: ["src/test_suite.ts"],
        outfile: "./dist/test_suite.js",
        ...platform_node_config,
    }),
    esbuild.build({
        bundle: true,
        minify: true,
        target: "es6",
        sourcemap: true,
        entryPoints: ["src/frontend/index.tsx"],
        outfile: `./public/${timestamp}.js`,
    }),
]).then(() => console.log(`Build succeeded in ${Date.now() - timestamp} ms`));
