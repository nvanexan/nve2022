---
seo_title: "Web Components | Nick Van Exan"
title: "Web Components"
author: "Nick Van Exan"
date: "2023-02-25T23:00:00Z"
social_image: ""
summary: "They keep getting better every day"
---

{% partial file="partials/article-title.md" /%}

A while back I re-wrote my website. Unhappy with the performance hits of large frameworks, I ripped out Next.JS and React along with it. I replaced those with my own custom build system powered by [Markdoc](https://markdoc.dev/). You can read more about the journey and the performance gains [here](https://nick.vanexan.ca/posts/markdoc).

At the time, I made an architectural decision to use an HTML renderer for my pages and to use [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) to add progressive enhancement where interactivity was desired. 

Web Components were a mixed bag of a choice. They run natively in the browsers, and so no framework is required to create custom elements and leverage a shadow dom. But their API is not super ergonomic (i.e. they're kind of verbose to write). And they necessarily require a browser to run, which for a time ruled out server-side rendering (SSR).

But things are changing. Quickly. And I think this is really good news.

## Ergonomics

There are a number of really good non-framework... err... frameworks... emerging for creating Web Components, which really improve the ergonomics of writing custom elements. I'll briefly mention my favourites.

[Lit](https://lit.dev/) is probably the most popular and well known. You can, for example, start a new [Vite](https://vitejs.dev/) project with Lit. It is also a default in the [Open WC generators](https://open-wc.org/docs/development/generator/). Lit is cool because it allows you to write your Web Components in TypeScript, with JSX-like syntax. It uses tagged template literals, which means you don't need to learn custom syntax and can just start writing custom elements without fuss. In addition, Lit has a tiny footprint, weighing in at about 5kb (minified and compressed). A small overhead for dramatically better authoring.

Here's an example of a web component written in Lit:

```typescript
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('simple-greeting')
export class SimpleGreeting extends LitElement {
  static styles = css`p { color: blue }`;

  @property()
  name = 'Somebody';

  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}
```

[Stencil](https://stenciljs.com/) is a more comprehensive library than Lit for building reusable, scalable design systems. On the surface, Stencil seems similar to Lit. You can use TypeScript. The syntax is JSX-like. There are decorators that shortcut a lot of things for you. But the true power of Stencil is, for me, in its intention of serving as a true design system library. Out of the box, it gives you everything you need to write your components, test them, document them, and define their types. 

Here's an example of a web component written in Stencil:

```typescript
@Component({
  tag: 'ds-text',
  styleUrl: 'ds-text.css',
  shadow: true,
})
export class Text {
  render() {
    return (
      <slot name=”ds-corp-text”>
        Your Text Rendered Here
      </slot>
    );
  }
}
```

But wait, there's more!

Stencil doesn't just allow you to build and output Web Components for use in your other projects; ==it also can compile your Web Component into framework-specific component code (such as Vue, React, Angular, etc.)==. This makes Stencil a great choice for teams looking to build a future proof design system at organizations that might be using [Micro Frontends](https://nick.vanexan.ca/posts/micro-frontends) with different frameworks and tech stacks.[^1] You can literally write a component once, and compile it for Web (as a custom element), React, Vue, etc. 

## SSR and Declarative Shadow Dom

Modern web sites and applications rely on static-site generation (SSG) and server-side rendering (SSR) to dramatically improve performance outcomes over traditional client-side only rendered (CSR) applications.

Using Web Components in your architecture can create a lot of headache if you're doing SSR. Why? Because until recently, the only way to use the native [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) was to construct a [Shadow Root](https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot) using JavaScript at runtime. There was no built-in way to express Shadow Roots in the server-generated HTML.

An important negative side effect of this lack of SSR support is layout shifting after the page has loaded, or temporary displays of a flash of unstyled content ("FOUC") while loading the Shadow Root's stylesheets. When a custom element is rendered by the server, but then has its Shadow Root created at runtime to "hydrate" the component, this can be the result. And it requires clever hacks to engineer around.

Until now. 

[Declarative Shadow DOM (DSD)](https://developer.chrome.com/articles/declarative-shadow-dom/) is a web platform feature currently in the standardization process that removes this limitation, bringing Shadow DOM to the server. And last week, the Chrome Dev team [announced](https://developer.chrome.com/articles/declarative-shadow-dom/) it would be enabled by default in Chrome 111.

You can read more about how DSD works at the links above. But the TLDR is, with the introduction of DSD, it's now possible for a Custom Element to have a shadow root before it gets upgraded. This means the element will have a `shadowRoot` property already available when it is instantiated, without your code having to explicitly create one.

As a new web platform API, Declarative Shadow DOM does not yet have widespread support across all browsers. But change is in the air. And the future for Web Components is looking bright.

{% partial file="partials/article-footer.md" /%}

[^1]: Indeed, some of the issues I mentioned in [this earlier post](https://nick.vanexan.ca/posts/micro-frontends) re disparate MFE tech stacks could fall away somewhat, at least at a technical level, if you use Stencil for your design system. Organizationally, I'd still recommend keeping a unifying stack for your MFEs.
