---
seo_title: "Markdoc"
title: "Markdoc"
author: "Nick Van Exan"
date: "2022-05-19T19:39:23Z"
social_image: ""
summary: "Using Markdoc for static site generation"
---

{% partial file="article-title.md" /%}

Last week I discovered [Markdoc](https://markdoc.io/). It's a markdown parser and authoring framework by the folks at [Stripe](https://stripe.com) that allows you to compose content in a fully declarative way.[^1] I love the philosophy and ambition. And I was excited to see that they allow for rendering to vanilla html, and not simply JSX or Next.JS or other frameworks.

For the past couple of years I've used [Next.JS](https://nextjs.org/) + [MDX](https://mdxjs.com/) to render my site. This worked well, and I thought the combination of static site rendering and then hydration with React was awesome. But over time, my site's style has become more and more stripped down, inspired by folks like [Hundred Rabbits](https://100r.co). Increasingly I've realized I don't need or want React at all. But there were no good markdown templating engines that suited my particular use cases, so I kept on with Next.JS and MDX. That is, until Markdoc came out.

## What Makes Markdoc Unique

The folks at Stripe have a good description of what makes Markdoc unique [here](https://markdoc.io/docs/overview). The highlights for me were:

1. It extends Markdown with a custom syntax for tags and annotations, providing a way to tailor content to individual users and introduce interactive elements, such as native web components.
2. It has a simple and elegant design: creating an abstract syntax tree, which you can then use to render HTML, JSX or anything else you want.
3. It provides an extensible system for defining custom tags that can be used seamlessly in Markdown content. This means it can support things like custom tags, conditional content, variable interpolation, and so on.

## How it works

Markdoc is a superset of Markdown (specifically the [CommonMark spec](https://spec.commonmark.org/)), which means the syntax you use for your content is basically just Markdown, but you can add additional custom content with custom "Tags". For example, let's say I wanted to render custom `<section>` elements within my markup. I can do that with Markdoc like so.

First, I would define that element in my markdown file using the Markdoc tag syntax.

```markdoc
{% section %}

This content will be rendered in a section element

{% /section %}
```

Second, I would create a custom Tag that gets used by the Markdoc parser and transformer to transform that document into HTML.

```typescript
import { Config, Node, Tag } from "@markdoc/markdoc";

export const section = {
  render: "section",
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

And that's basically it. The end result is a `<section>` tag in my HTML, which I can then style or augment with JS as needed.[^2]

```html
<section>
  <p>This content will be rendered in a section element.</p>
</section>
```

## Rewriting My Site & Performance Gains

I spent last weekend re-writing my site to make use of Markdoc. I cut a fresh repo. I built a simple build script in TypeScript which takes my markdown files, templated with Markdoc, and renders them to static html pages. There's a bit more to it than that, of course. I had to add support for CSS parsing, so critical styles could be injected into the html files before the global.css loaded, frontmatter parsing for meta tags for SEO reasons, etc.

The performance results were quite impressive. Some comparisons of lighthouse metrics...

![Next.JS + MDX version - desktop](/public/images/old-site-desktop.webp "Next.JS + MDX version - desktop")

![Custom Markdoc version - desktop](/public/images/new-site-desktop.webp "Custom Markdoc version - desktop")

![Next.JS + MDX version - mobile](/public/images/old-site-mobile.webp "Next.JS + MDX version - mobile")

![Custom Markdoc version - mobile](/public/images/new-site-mobile.webp "Custom Markdoc version - mobile")

## Gotchas and Take-Aways

I really like Markdoc and I will continue to keep using it. There were some hurdles I had to surmount though in re-writing my site.

First, there were some bugs. I noticed that the image tag, for example, said it supported an optional title attribute. But the parser did not actually return a title attribute. The good news is, because this is open source, and because it's some members of the Stripe team maintaining this repo, I [posted an issue on GitHub](https://github.com/markdoc/markdoc/issues/28), [submitted a PR](https://github.com/markdoc/markdoc/pull/38), and it's now patched up.[^3]

Second, not all Markdown tokens are supported by Markdoc. Footnotes, for example, are not supported at the time of writing. You can definitely create a custom paragraph tag that sort of hacks around this problem, and builds footnote refs in the paragraph and appends a list of footnote items to the end of the document. That's what I did for this site initially. But it wasn't super ideal. [I've since made a PR to the Markdoc repo](https://github.com/markdoc/markdoc/pull/40) to provide support for footnotes in the Markdoc parser itself. Hopefully that will go through and get incorporated in near future releases. 🤞

Third, there is the age-old engineering issue of trade-offs. I had some hesitation about incorporating a specific syntax into my fairly vanilla markdown files. To be sure, I had to make this choice when I chose MDX before too. But it is an important consideration, as you will start to get married to the specific syntax. For example, at the top of my blog posts, I use a [Markdoc partial](https://markdoc.io/docs/partials) to render the header of each post, so I can keep my code dry and not have to repeat this everywhere. But when viewing the document outside of this website, the syntax appears alien and not super fun to look at. If you value content _as content_ - as readable text and not much else - then Markdoc is likely not for you.

Fourth, it's important to keep in mind what renderer you're going to use. JSX works great for static rendering because it renders well on the server. But [static rendering of native web components isn't well supported](https://lamplightdev.com/blog/2019/07/20/how-to-server-side-render-web-components/) because, well, those components rely on the actual browser window for operation. Accordingly, if you are worried about layout shifts that might occur between a statically rendered page and the time it takes for the web components to load and do their thing, you are likely better off [combining Markdoc with Next.JS](https://markdoc.io/docs/nextjs) or another such framework, and not using the basic [HTML renderer](https://markdoc.io/docs/examples/html) like I've done for this wee site here.

[^1]: Unlike [MDX](https://mdxjs.com/), you don't embed code or react components. It's more like the [Liquid template language](https://shopify.github.io/liquid/) developed by Shopify.
[^2]: Note that you're not just confined to rendering semantic HTML tags. You can also render custom elements that correspond to your [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). And that's awesome. Because you can basically at that point get the benefit of both markdown for content authoring and interactive richness that comes with web components and the built in shadow dom.
[^3]: The folks at Stripe maintaing Markdoc are quite responsive, so shoutout to them!
