import Markdoc, { Config, ConfigType, Node } from "@markdoc/markdoc";
import pages from "../src/pages.json";
import BuildHelpers from "./helpers";
import PurgeCSS from "purgecss";
import yaml from "js-yaml";
import { format, parseISO } from "date-fns";
import { v4 as uuid } from "uuid";
import { ArticleFrontMatter } from "./types";
import Parser from "./parser";

class Compiler {
  private config: ConfigType;
  private parser: Parser;

  constructor(config: ConfigType) {
    this.config = config;
    this.parser = new Parser();
  }

  public async compile(
    contentPath: string,
    templateFileName: string,
    config: ConfigType
  ) {
    console.log(`compiling ${contentPath} => ${templateFileName}`);
    // Get source and template files
    const [contentFileName, contentDir] = this.parseFileName(contentPath);
    const template = BuildHelpers.getTemplate(templateFileName);
    const source = BuildHelpers.getContent(contentPath);

    // Parse to AST & validate
    const ast = this.parser.parse(source);
    this.checkForValidationErrors(ast, config);

    // Assign frontmatter to variables
    const frontmatter = this.parseFrontMatter(ast.attributes.frontmatter);
    if (config.variables) config.variables.frontmatter = frontmatter;

    // Transform and render
    const content = Markdoc.transform(ast, config);
    const rendered = Markdoc.renderers.html(content) || "";

    // Create the meta tags
    let html = this.buildMetaTags(
      frontmatter,
      contentDir,
      contentFileName,
      template
    );

    // Create the content
    html = html.replace(/{{ CONTENT }}/, rendered);

    // Create the critical CSS
    html = await this.injectCss(html);

    // Inject prefetch links
    html = this.injectPrefetchLinks(ast, html);

    // Write the file
    BuildHelpers.writeFile(contentDir, contentFileName, html);
  }

  public async compilePages() {
    // For each page / template pair, compile page content into a file
    const pagesToCompile = Object.entries(pages).map(([path, template]) => {
      return this.compile(path, template, this.config);
    });
    await Promise.all(pagesToCompile);
  }

  private async injectCss(html: string) {
    const css = await new PurgeCSS().purge({
      content: [
        {
          raw: html,
          extension: "html",
        },
      ],
      css: ["src/styles/global.css", "src/styles/prism-theme.css"],
      variables: true,
    });

    return html.replace(
      /<!-- {{ SERVER_STYLES }} -->/,
      `<style>${css[0].css}</style>`
    );
  }

  private getLinks(matches: any[], node: Node) {
    if (node.type === "link" && node.attributes.href.charAt(0) === "/") {
      matches.push(node.attributes.href);
    }
    node.children.forEach((node) => this.getLinks(matches, node));
  }

  private injectPrefetchLinks(node: Node, html: string) {
    const links = ["/"] as any[];
    this.getLinks(links, node);
    const linkTags = links
      .map((l: string) => `<link rel="prefetch" href="${l}" />`)
      .join("");
    return html.replace(/<!-- {{ PREFETCH_ROUTES }} -->/, linkTags);
  }

  private checkForValidationErrors(node: Node, config: Config) {
    const errors = Markdoc.validate(node, config);
    if (errors?.length > 0) {
      console.log(
        "-------------------- MARKDOC VALIDATION ERRORS ---------------------------"
      );
      console.log(errors);
    }
  }

  private parseFileName(path: string) {
    const paths = path.split("/");
    const fileName = paths.pop() || "";
    const [, name] = fileName.match(/(.+?)(\.[^.]*$|$)/im) || [
      fileName,
      "",
      "",
    ];
    return [name, paths[0]];
  }

  private parseFrontMatter(frontmatter: string): ArticleFrontMatter | any {
    if (!frontmatter) return {};
    const result = yaml.load(frontmatter) as ArticleFrontMatter;
    if (result.date)
      result.shortDate = format(parseISO(result.date), "MM/dd/yy");
    return result;
  }

  private buildMetaTags(
    frontmatter: ArticleFrontMatter,
    path: string,
    fileName: string,
    html: string
  ) {
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
  }
}

export default Compiler;
