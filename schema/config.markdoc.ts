import { ConfigType, parse } from "@markdoc/markdoc";
import { getContent } from "../lib/helpers";
import { spacer } from "./spacer.markdoc";
import { header } from "./header.markdoc";
import { link } from "./link.markdoc";
import { nav } from "./nav.markdoc";
import { section } from "./section.markdoc";
import { text } from "./text.markdoc";
import { paragraph } from "./paragraph.markdoc";
import { image } from "./image.markdoc";

export const config = {
  nodes: {
    link: link,
    text: text,
    paragraph: paragraph,
    image: image,
  },
  tags: {
    spacer,
    header,
    nav,
    section,
  },
  partials: {
    "meta.md": parse(getContent("partials/meta")),
    "article-title.md": parse(getContent("partials/article-title")),
  },
} as ConfigType;
