import { ConfigType, parse } from "@markdoc/markdoc";
import { getContent } from "../lib/helpers";
import { spacer } from "./spacer.markdoc";
import { header } from "./header.markdoc";
import { link } from "./link.markdoc";
import { nav } from "./nav.markdoc";
import { section } from "./section.markdoc";
import { text } from "./text.markdoc";
import { image } from "./image.markdoc";
import { fence } from "./fence.markdoc";

export const config = {
  nodes: {
    link: link,
    text: text,
    image: image,
    fence: fence,
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
