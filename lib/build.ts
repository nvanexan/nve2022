import Markdoc from "@markdoc/markdoc";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import watch from "glob-watcher";
import parseArgs from "minimist";
import { Parcel } from "@parcel/core";
import pages from "../src/pages.json";
import { config } from "./markdoc.config";

const argv = parseArgs(process.argv.slice(2));

const BUILD_DIR = "./dist";

function getTemplate(fileName: string) {
  // TODO: make async
  return readFileSync(
    path.resolve("./src/templates", `${fileName}.html`),
    "utf-8"
  );
}

function getContent(fileName: string) {
  // TODO: make async
  return readFileSync(path.resolve("./content", `${fileName}.md`), "utf-8");
}

function writeFile(dir: string, fileName: string, html: string) {
  // TODO: make async
  const path = dir ? `${BUILD_DIR}/${dir}` : `${BUILD_DIR}`;
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
  writeFileSync(`${path}/${fileName}.html`, html);
}

function parseFrontMatter(frontmatter: string) {
  return frontmatter.split("\n").reduce((acc: any, item: string) => {
    const [key, val] = item.split(": ");
    return { ...acc, ...{ [key]: JSON.parse(val) } };
  }, {});
}

function compile(contentPath: string, templateFileName: string) {
  const [contentFileName, contentDir] = parseFileName(contentPath);
  const template = getTemplate(templateFileName);
  const source = getContent(contentPath);
  const ast = Markdoc.parse(source);
  console.log(ast);
  console.log(config);
  const content = Markdoc.transform(ast, config);
  console.log(content);
  const rendered = Markdoc.renderers.html(content) || "";
  console.log(rendered);
  const frontmatter = parseFrontMatter(ast.attributes.frontmatter);
  const html = template
    .replace(/{{ PAGE_TITLE }}/, frontmatter.html_title)
    .replace(/{{ CONTENT }}/, rendered);
  writeFile(contentDir, contentFileName, html);
}

function compilePages() {
  // For each page / template pair, compile page content into a file
  Object.entries(pages).forEach(([path, template]) => {
    console.log(`Compiling: ${path}`);
    compile(path, template);
  });

  console.log("Finished compiling pages");
}

function parseFileName(path: string) {
  const paths = path.split("/");
  const fileName = paths.pop() || "";
  const [, name] = fileName.match(/(.+?)(\.[^.]*$|$)/im) || [fileName, "", ""];
  return [name, paths[0]];
}

function runContentWatcher() {
  const watcher = watch(["./content/**/*.md"]);
  console.log("Listening for changes...");
  watcher.on("change", function (path) {
    const [fileName] = parseFileName(path);
    const template = pages[fileName as "now"];
    console.log(`A file has changed, recompiling ${path}...`);
    compile(fileName, template);
  });
  watcher.on("add", function (path) {
    console.log("A file has been added, recompiling pages...");
    compilePages();
  });
}

// function runManifestWatcher() {
//   const watcher = watch(["./src/pages.json"]);
//   watcher.on("change", function (path) {
//     console.log(`Page manifest has changed, recompiling pages...`);
//     compilePages();
//   });
// }

async function runParcelWatcher() {
  let bundler = new Parcel({
    entries: ["./src/main.ts", "./src/components/**/*", "./src/styles/**/*"],
    defaultConfig: "@parcel/config-default",
    serveOptions: {
      port: 3000,
    },
    hmrOptions: {
      port: 3000,
    },
  });

  let subscription = await bundler.watch((err, event) => {
    if (err) {
      // fatal error
      throw err;
    }

    if (event?.type === "buildSuccess") {
      let bundles = event.bundleGraph.getBundles();
      console.log(
        `✨ Built ${bundles.length} bundles in ${event.buildTime}ms!`
      );
    } else if (event?.type === "buildFailure") {
      console.log(event.diagnostics);
    }
  });
}

compilePages();

if (argv.watch) {
  runParcelWatcher();
  runContentWatcher();
} else {
  process.exit();
}
