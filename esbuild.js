const fs = require("fs");
const esbuild = require("esbuild");
const gzipPlugin = require('@luncheon/esbuild-plugin-gzip');
const timestamp = Date.now();

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
        bundle: true,
        minify: true,
        write: false,
        target: "es6",
        sourcemap: true,
        entryPoints: ["src/frontend/index.tsx"],
        outfile: `./public/${timestamp}.js`,
        plugins: [gzipPlugin()],
    }),
]).then(() => console.log(`Build succeeded in ${Date.now() - timestamp} ms`));
