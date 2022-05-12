import Markdoc from "@markdoc/markdoc";
import { readFileSync, writeFileSync, existsSync, mkdirSync, write } from "fs";
import path from "path";
import pages from "../src/pages.json";

import DashedList from "../schema/DashedList.markdoc";

const config = {
  tags: {
    DashedList,
  },
};

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

function writeFile(fileName: string, html: string) {
  // TODO: make async
  if (!existsSync("./build")) {
    mkdirSync("./build");
  }
  writeFileSync(`./build/${fileName}.html`, html);
}

function parseFrontMatter(frontmatter: string) {
  return frontmatter.split("\n").reduce((acc: any, item: string) => {
    const [key, val] = item.split(": ");
    return { ...acc, ...{ [key]: JSON.parse(val) } };
  }, {});
}

function compile(contentFileName: string, templateFileName: string) {
  const template = getTemplate(templateFileName);
  const source = getContent(contentFileName);
  const ast = Markdoc.parse(source);
  // console.log(ast);
  const content = Markdoc.transform(ast, config);
  const rendered = Markdoc.renderers.html(content) || "";
  const frontmatter = parseFrontMatter(ast.attributes.frontmatter);
  const html = template
    .replace(/{{ PAGE_TITLE }}/, frontmatter.html_title)
    .replace(/{{ CONTENT }}/, rendered);
  writeFile(contentFileName, html);
}

// For each page / template pair, compile page content into a file
Object.entries(pages).forEach(([file, template]) => {
  compile(file, template);
});
