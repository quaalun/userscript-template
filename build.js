import { argv } from "process";
import esbuild from "esbuild";

import package_json from "./package.json" with { type: "json" };

const watch_port = 4000;
const updateURL_web = "http://url/to/host/main.user.js";
const updateURL_local = `http://127.0.0.1:${watch_port}/main.user.js`;
const urlMatchRegex = "https://www.example.com/*";
const iconUrl = "https://www.example.com/favicons?sz=64";
const grant = "none";

{
  let isWatch, isProduction;
  isWatch = argv.some((arg) => {
    if (arg.includes("--watch")) {
      return true;
    }
  });

  isProduction = argv.some((value) => {
    if (value.includes("--production")) {
      return true;
    }
  });

  const updateURL = isProduction ? updateURL_web : updateURL_local;

  const buildOptions = {
    entryPoints: ["src/main.user.js"],
    bundle: true,
    minify: true,
    banner: {
      js: `\
// ==UserScript==
// @name        ${package_json.name}
// @version     ${package_json.version}
// @description ${package_json.description}
// @author      ${package_json.author || "someone"}
// @updateURL   ${updateURL}
// @downloadURL ${updateURL}
// @match       ${urlMatchRegex}
// @icon        ${iconUrl}
// @grant       ${grant}
// ==/UserScript==
`,
    },
    outdir: "dist",
  };

  if (isWatch) {
    esbuild.context(buildOptions).then((entryPoints) => {
      entryPoints.watch();
      entryPoints.serve({
        port: 4000,
        onRequest: (args) => {
          console.log(args);
        },
      });
    });
  } else {
    esbuild.build(buildOptions);
  }
}
