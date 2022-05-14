import Markdoc, { Ast, Config, Node } from "@markdoc/markdoc";
import watch from "glob-watcher";
import parseArgs from "minimist";
import { Parcel } from "@parcel/core";
import pages from "../src/pages.json";
import { config } from "../schema/config.markdoc";
import {
  copyFolderRecursiveSync,
  getContent,
  getTemplate,
  writeFile,
} from "./helpers";
import PurgeCSS from "purgecss";
import yaml from "js-yaml";
import { format, parseISO } from "date-fns";

const argv = parseArgs(process.argv.slice(2));

export const BUILD_DIR = "./dist";

interface ArticleFrontMatter {
  html_title: string;
  title: string;
  date: string;
  shortDate: string;
  social_image: string;
  summary: string;
  published: boolean;
}

export function parseFrontMatter(
  frontmatter: string
): ArticleFrontMatter | any {
  if (!frontmatter) return {};
  const result = yaml.load(frontmatter) as ArticleFrontMatter;
  if (result.date) result.shortDate = format(parseISO(result.date), "MM/dd/yy");
  return result;
}

async function injectCss(html: string) {
  const css = await new PurgeCSS().purge({
    content: [
      {
        raw: html,
        extension: "html",
      },
    ],
    css: ["src/styles/global.css"],
    variables: true,
  });

  return html.replace(
    /<!-- {{ SERVER_STYLES }} -->/,
    `<style>${css[0].css}</style>`
  );
}

const getLinks = (matches: any[]) => (ast: Node) => {
  if (ast.type === "link" && ast.attributes.href.charAt(0) === "/") {
    matches.push(ast.attributes.href);
  }
  ast.children.forEach((node) => getLinks(matches)(node));
};

function injectPrefetchLinks(ast: Node, html: string) {
  const links = ["/"] as any[];
  getLinks(links)(ast);
  const linkTags = links
    .map((l: string) => `<link rel="prefetch" href="${l}" />`)
    .join("");
  return html.replace(/<!-- {{ PREFETCH_ROUTES }} -->/, linkTags);
}

function checkForValidationErrors(ast: Node, config: Config) {
  const errors = Markdoc.validate(ast, config);
  if (errors?.length > 0) {
    console.log(
      "-------------------- MARKDOC VALIDATION ERRORS ---------------------------"
    );
    console.log(errors);
  }
}

async function compile(contentPath: string, templateFileName: string) {
  const [contentFileName, contentDir] = parseFileName(contentPath);
  const template = getTemplate(templateFileName);
  const source = getContent(contentPath);
  const ast = Markdoc.parse(source);
  checkForValidationErrors(ast, config);
  const frontmatter = parseFrontMatter(ast.attributes.frontmatter);
  const finalConfig = {
    ...config,
    ...{ variables: { ...config.variables, ...{ frontmatter } } },
  };
  const content = Markdoc.transform(ast, finalConfig);
  const rendered = Markdoc.renderers.html(content) || "";
  let html = template
    .replace(/{{ PAGE_TITLE }}/, frontmatter.html_title)
    .replace(/{{ CONTENT }}/, rendered);

  // html = await injectCss(html);
  html = injectPrefetchLinks(ast, html);

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

function copyPublic() {
  copyFolderRecursiveSync("./public", "./dist/");
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
    // const [fileName] = parseFileName(path);
    // const template = pages[fileName as "now"];
    // console.log(`A file has changed, recompiling ${path}...`);
    // compile(fileName, template);
    console.log("A file has changed, recompiling pages...");
    compilePages();
  });
  watcher.on("add", function (path) {
    console.log("A file has been added, recompiling pages...");
    compilePages();
  });
}

function runPublicWatcher() {
  const watcher = watch(["./public"]);
  watcher.on("change", function (path) {
    console.log(`Public contents have changed, recopying...`);
    copyPublic();
  });
}

async function runParcelWatcher() {
  let bundler = new Parcel({
    entries: ["./src/main.ts", "./src/components/**/*", "./src/styles/**/*"],
    defaultConfig: "@parcel/config-default",
  });

  await bundler.watch((err, event) => {
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
copyPublic();

if (argv.watch) {
  runParcelWatcher();
  runContentWatcher();
  runPublicWatcher();
} else {
  process.exit();
}
