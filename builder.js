import { build } from "esbuild";

build({
    bundle: true,
    logLevel: "info",
    entryPoints: ['src/main.js'],
    outfile: "dist/tgreplaybot.js",
    minify: false,
    minifyWhitespace: true,
    minifySyntax: true,
    minifyIdentifiers: false,
    format: "esm",
    target: "esnext",
    platform: "node",
    treeShaking: true,
    banner: {
        js: `
import {createRequire} from "module";
const require = createRequire(import.meta.url);
`
    }
}).catch(() => process.exit(1));
