---
seo_title: "Markdoc | Nick Van Exan"
title: "Markdoc"
author: "Nick Van Exan"
date: "2022-05-19T19:39:23Z"
social_image: "https://user-images.githubusercontent.com/62121649/166573698-b4bc876e-bca5-4476-be7e-f1ca6c1a17d7.png"
summary: "Using Markdoc for static site generation"
---

{% partial file="article-title.md" /%}

Last week I discovered [Markdoc](https://markdoc.io/). It's a Markdown parser and authoring framework by the folks at [Stripe](https://stripe.com) that allows you to _compose_ content in a fully declarative way.[^1] I love the philosophy and ambition.

For the past couple of years I've used [Next.JS](https://nextjs.org/) + [MDX](https://mdxjs.com/) to render my site. This worked well, and I thought the combination of static site rendering and then hydration with React was great. But over time, I've learned that I don't need or want React at all. All I really need is some HTML and CSS with a sprinkle of JS here and there. I got pretty close to this on the last iteration of my site, but ultimately needed MDX and Next.JS to help shape my Markdown into a design.

Markdown is great, and you can use it to express quite a bit, but there's always been a "last mile" wherein you need something else to get your Markdown files transformed into the HTML needed to match your design and interactivity goals. And it's here - precisely in this last mile - that Markdoc fills an important void.

## What makes Markdoc unique

The folks at Stripe have a good description of what makes Markdoc unique [here](https://markdoc.io/docs/overview). The highlights for me were:

1. It extends Markdown with a custom syntax for tags and annotations, providing a way to tailor content to individual users and introduce interactive elements, such as native web components.
2. It has a simple and elegant design: creating an abstract syntax tree, which you can then use to render HTML, JSX or anything else you want.
3. It provides an extensible system for defining custom tags that can be used seamlessly in Markdown content. This means it can support things like custom tags, conditional content, variable interpolation, and so on.

And I was excited to see that they included an HTML renderer in addition to renderers for JSX. The dream of being able to go from Markdown to a more sophisticated HTML / CSS template, without React, finally seemed feasible.

## How it works

Markdoc is a superset of Markdown (specifically the [CommonMark spec](https://spec.commonmark.org/)), which means the syntax you use for your content is basically just Markdown, but you can add additional custom content with custom "Tags".

There's [three phases](https://markdoc.io/docs/render) to rendering Markdoc: (1) parse; (2) transform; (3) render. You pass your content into the parser. The parser creates an [abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree), which you then process through a transformer method into objects the renderer can understand, and then the renderer renders the desired output (HTML, JSX, etc.).

For example, let's say I wanted to render custom `<section>` elements within my markup. I can do that with Markdoc like so.

First, I would define that element in my Markdown file using the Markdoc tag syntax.

```liquid
# Header

{% section %}

This content will be rendered in a `section` element

{% /section %}
```

Second, I would create a custom Tag schema and add it to the config object I will eventually pass to the Markdoc parser for parsing.

```typescript
import { Config, Node, Tag } from "@markdoc/markdoc";

export const section = {
  description: "Create a section container",
  children: ["heading", "paragraph", "list", "item", "tag"],
  attributes: {},
  transform: (node: Node, config: Config) => {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Tag(`section`, attributes, children);
  },
};
```

```typescript
import { section } from "./section.markdoc";

export const config = {
  nodes: {},
  tags: {
    section,
  },
  partials: {},
};
```

Third, I would pass the content I want to transform and the config with my custom Tags to Markdoc to parse.

```javascript
import { config } from "./config.markdoc";

const ast = Markdoc.parse(markdownFile);
const content = Markdoc.transform(ast, config);
const html = Markdoc.renderers.html(content);
```

And that's basically it. Applied to the example above, the end result is a `<section>` tag in my HTML, which I can then style or augment with JS as needed.[^2]

```html
<article>
  <h1>Header</h1>
  <section>
    <p>This content will be rendered in a <code>section</code> element.</p>
  </section>
</article>
```

I can now reuse the `{% section %}` tag anywhere in my Markdown documents. And you can certainly go further. For example, instead of rendering a simple `<section>` element, you can render a [web component](https://developer.mozilla.org/en-US/docs/Web/Web_Components), complete with its own UI logic and shadow dom.

You can also [conditionally render section blocks](https://markdoc.io/docs/tags#built-in-tags), use [partials](https://markdoc.io/docs/partials) to DRY out your Markdown content that is repetitive across files, define and use [variables](https://markdoc.io/docs/variables), and [so on](https://markdoc.io/docs/getting-started).

## Performance gains using Markdoc + custom build

I spent last weekend re-writing my site to remove Next.JS (and thus React) and make use of Markdoc. I cut a [fresh repo](https://github.com/nvanexan/nve2022). I built a simple build script in TypeScript which takes my Markdown files, templated with Markdoc, and renders them to static html pages using the Markdoc HTML renderer.

There's a bit more to it than that, of course. I had to add support for CSS parsing, so critical styles could be injected into the html files before the global.css loaded, frontmatter parsing for meta tags for SEO reasons, etc. But by the end of the weekend, I had succeeded in removing React and creating a super lightweight site of basically just HTML and CSS.

The performance results were fun. Some comparisons of [Lighthouse](https://developers.google.com/web/tools/lighthouse) metrics...

![Next.JS + MDX version - desktop](/public/images/old-site-desktop.webp "Next.JS + MDX version - desktop")

![Custom Markdoc version - desktop](/public/images/new-site-desktop.webp "Custom Markdoc version - desktop")

![Next.JS + MDX version - mobile](/public/images/old-site-mobile.webp "Next.JS + MDX version - mobile")

![Custom Markdoc version - mobile](/public/images/new-site-mobile.webp "Custom Markdoc version - mobile")

## Lessons learned

I learned some lessons along my journey.

First, not all Markdown tokens are supported by Markdoc. Footnotes, for example, are not supported at the time of writing. You can definitely create a custom paragraph tag that sort of hacks around this problem, and builds footnote refs in the paragraph and appends a list of footnote items to the end of the document. That's what I did for this site at the time of writing. But it wasn't super ideal. [I've since made a PR to the Markdoc repo](https://github.com/markdoc/markdoc/pull/40) to provide support for footnotes in the Markdoc parser itself. Hopefully that will go through and get incorporated in near future releases.[^3] 🤞

Second, there is the age-old engineering issue of trade-offs. I had some hesitation about incorporating a specific syntax into my fairly vanilla Markdown files. To be sure, I had to make this choice when I chose MDX before too. But it is an important consideration, as you will start to get married to the specific syntax. For example, at the top of my blog posts, I use a [Markdoc partial](https://markdoc.io/docs/partials) to render the header of each post, so I can keep my code dry and not have to repeat this everywhere. But when viewing the document outside of this website, the syntax appears alien and not super fun to look at. If you value _clean_ and _portable_ Markdown (_i.e._ easily readable / parseable / transferrable across apps and other places that accept Markdown) then Markdoc is likely not for you.

Third, it's important to keep in mind what renderer you're going to use. In my case I chose to render HTML instead of JSX, so I could use basic HTML and then add web components as needed. But [static rendering of native web components isn't well supported](https://lamplightdev.com/blog/2019/07/20/how-to-server-side-render-web-components/) because, well, those components rely on the actual browser window for operation. So there's more cognitive effort required to do static snd progressive enhancement with web components to avoid layout shifts, etc. Accordingly, you may wish to [combine Markdoc with Next.JS](https://markdoc.io/docs/nextjs) or [React](https://markdoc.io/docs/examples/react) if it better fits your use case.

## Concluding thoughts

[Markdoc](https://markdoc.io) is super great. And powerful. If you've ever wanted your Markdown to support things like templating, conditionals, variables, etc., Markdoc makes it dead easy to support and implement, with a nice API for extending and building your own tags.

I'm going to keep experimenting with it, and contributing to it too. I think it has a lot of value and promise.

[^1]: Unlike [MDX](https://mdxjs.com/), you don't embed code or react components. It's more like the [Liquid template language](https://shopify.github.io/liquid/) developed by Shopify.
[^2]: Note that you're not just confined to rendering semantic HTML tags. You can also render custom elements that correspond to your [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). And that's awesome. Because you can basically at that point get the benefit of both Markdown for content authoring and interactive richness that comes with web components and the built in shadow dom.
[^3]: The folks at Stripe who are maintaing Markdoc are quite responsive. Shoutout to them, and hat tip to the company for open sourcing this.
