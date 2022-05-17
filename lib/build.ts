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
import { v4 as uuid } from "uuid";

const argv = parseArgs(process.argv.slice(2));

export const BUILD_DIR = "./dist";

interface ArticleFrontMatter {
  seo_title: string;
  seo_description: string;
  title: string;
  summary: string;
  date: string;
  shortDate: string;
  social_image: string;
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

const buildMetaTags =
  (frontmatter: ArticleFrontMatter, path: string, fileName: string) =>
  (html: string) => {
    let { seo_title, seo_description } = frontmatter;
    let base_url = "https://nick.vanexan.ca";
    let seo_url = path
      ? `${base_url}/${path}/${fileName}`
      : `${base_url}/${fileName}`;
    let twitter_social_image = `${base_url}/public/nve-social-logo-twitter.png?${uuid()}`;
    let social_image = `${base_url}/public/nve-social-logo.png`;

    if (frontmatter.social_image)
      twitter_social_image = social_image = frontmatter.social_image;

    if (!seo_description) seo_description = frontmatter.summary;

    if (seo_url.includes("/index")) seo_url = base_url;

    const tokens = {
      seo_title,
      seo_description,
      twitter_social_image,
      social_image,
      base_url,
      seo_url,
    };

    const result = Object.entries(tokens).reduce((result, [key, value]) => {
      return result.replaceAll(`{{ ${key} }}`, value);
    }, html);

    return result;
  };

async function compile(contentPath: string, templateFileName: string) {
  console.log(`compiling ${contentPath} => ${templateFileName}`);
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
  let html = buildMetaTags(
    frontmatter,
    contentDir,
    contentFileName
  )(template).replace(/{{ CONTENT }}/, rendered);

  html = await injectCss(html);
  html = injectPrefetchLinks(ast, html);

  writeFile(contentDir, contentFileName, html);
}

async function compilePages() {
  // For each page / template pair, compile page content into a file
  const pagesToCompile = Object.entries(pages).map(([path, template]) => {
    return compile(path, template);
  });
  await Promise.all(pagesToCompile);
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
  watcher.on("change", async function (path) {
    // const [fileName] = parseFileName(path);
    // const template = pages[fileName as "now"];
    // console.log(`A file has changed, recompiling ${path}...`);
    // compile(fileName, template);
    console.log("A file has changed, recompiling pages...");
    await compilePages();
  });
  watcher.on("add", async function (path) {
    console.log("A file has been added, recompiling pages...");
    await compilePages();
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
      compilePages();
    } else if (event?.type === "buildFailure") {
      console.log(event.diagnostics);
    }
  });
}

async function start() {
  if (argv.watch) {
    copyPublic();
    runParcelWatcher();
    runContentWatcher();
    runPublicWatcher();
  } else {
    copyPublic();
    await compilePages();
    process.exit();
  }
}

start();
