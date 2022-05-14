import { ConfigType, parse } from "@markdoc/markdoc";
import { getContent } from "../lib/helpers";
import { spacer } from "./spacer.markdoc";
import { header } from "./header.markdoc";
import { link } from "./link.markdoc";
import { nav } from "./nav.markdoc";
import { section } from "./section.markdoc";

export const config = {
  nodes: {
    link: link,
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
