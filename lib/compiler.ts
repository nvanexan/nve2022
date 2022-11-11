import Markdoc, { Config, ConfigType, Node } from "@markdoc/markdoc";
import BuildHelpers from "./helpers";
import PurgeCSS from "purgecss";
import yaml from "js-yaml";
import { format, parseISO } from "date-fns";
import { v4 as uuid } from "uuid";
import { IArticleFrontMatter } from "./types";
import Parser from "./parser";
import RSS from "rss";

class Compiler {
  private BASE_URL: string = "https://nick.vanexan.ca";

  private config: ConfigType;
  private parser: Parser;

  constructor(config: ConfigType) {
    this.parser = new Parser();
    this.config = config;
  }

  public async init() {
    await this.initPartials();
  }

  public async compile(contentPath: string, config: ConfigType) {
    console.log(`compiling ${contentPath}`);
    // Get source and template files
    const [contentFileName, contentDir] = this.parseFileName(contentPath);
    const template = await BuildHelpers.getTemplateAsync(contentPath);
    const source = await BuildHelpers.getContentAsync(contentPath);

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
    html = html
      .replace(/{{ CONTENT }}/, rendered)
      .replace(/{{ PUB_DATE }}/, frontmatter.date);

    // Create the critical CSS
    html = await this.injectCss(html);

    // Inject prefetch links
    html = this.injectPrefetchLinks(ast, html);

    // Write the file
    await BuildHelpers.writeFileAsync(contentDir, contentFileName, html);
  }

  public async compilePages() {
    console.log("------- compiling pages... -------");
    for await (const f of BuildHelpers.getAllFiles("./content")) {
      if (f.includes("partials")) continue;
      await this.compile(f, this.config);
    }
    console.log("------- pages compiled -------");
  }

  public async compileRss() {
    console.log("------- compiling RSS feed... -------");
    const baseUrl = this.BASE_URL;

    const feed = new RSS({
      title: "Changelog | Nick Van Exan",
      description: "Nick's monthly updates",
      site_url: baseUrl,
      feed_url: baseUrl,
    });

    const logs = [] as any[];
    for await (const f of BuildHelpers.getAllFiles("./content/changelog")) {
      // Remove the article-title when incorporating the log in a feed
      const fileContent = await (
        await BuildHelpers.getContentAsync(f)
      ).replace('{% partial file="partials/article-title.md" /%}', "");
      const ast = this.parser.parse(fileContent);
      const frontmatter = this.parseFrontMatter(ast.attributes.frontmatter);
      const content = Markdoc.renderers.html(
        Markdoc.transform(ast, this.config)
      );
      logs.push({ file: f, frontmatter, content });
    }

    logs
      .reverse()
      .forEach(
        (l: {
          file: string;
          frontmatter: IArticleFrontMatter;
          content: string;
        }) => {
          console.log(`Adding RSS item: ${l.frontmatter.title}`);
          feed.item({
            title: l.frontmatter.title,
            guid: `${l.file.replace(".md", "")}`,
            url: `${baseUrl}/${l.file.replace(".md", "")}`,
            date: l.frontmatter.date,
            description: l.content,
          });
        }
      );

    const xml = feed.xml({ indent: true });
    await BuildHelpers.writeRss(xml);
    console.log("------- RSS feed compiled -------");
  }

  private async initPartials() {
    console.log("------- initializing partials... -------");
    const partials = {} as any;

    // Get anything in the partials directory of content, and add to partials
    for await (const f of BuildHelpers.getAllFiles("./content/partials")) {
      console.log(f);
      partials[f] = this.parser.parse(await BuildHelpers.getContentAsync(f));
    }

    // Get anything in the changelog directory of content, and add to partials
    for await (const f of BuildHelpers.getAllFiles("./content/changelog")) {
      console.log(f);
      // Remove the article-title when incorporating the log as a partial
      const content = await (
        await BuildHelpers.getContentAsync(f)
      ).replace('{% partial file="partials/article-title.md" /%}', "");
      partials[f] = this.parser.parse(content);
    }

    this.config.partials = partials;
    console.log("------- partials initialized -------");
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

  private parseFrontMatter(frontmatter: string): IArticleFrontMatter | any {
    if (!frontmatter) return {};
    const result = yaml.load(frontmatter) as IArticleFrontMatter;
    if (result.date)
      result.shortDate = format(parseISO(result.date), "MM/dd/yy");
    return result;
  }

  private buildMetaTags(
    frontmatter: IArticleFrontMatter,
    path: string,
    fileName: string,
    html: string
  ) {
    let { seo_title, seo_description } = frontmatter;
    let base_url = this.BASE_URL;
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
