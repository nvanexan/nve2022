import Helpers from "../lib/helpers";
import { ConfigType, parse } from "@markdoc/markdoc";
import { spacer } from "./spacer.markdoc";
import { header } from "./header.markdoc";
import { link } from "./link.markdoc";
import { nav } from "./nav.markdoc";
import { section } from "./section.markdoc";
import { text } from "./text.markdoc";
import { paragraph } from "./paragraph.markdoc";
import { image } from "./image.markdoc";
import { fence } from "./fence.markdoc";
import { footnoteRef } from "./footnoteRef.markdoc";
import { footnoteItem } from "./footnoteItem.markdoc";
import { inline } from "./inline.markdoc";
import { list } from "./list.markdoc";

export const config = {
  nodes: {
    link,
    text,
    paragraph,
    image,
    fence,
    inline,
    list,
    footnoteRef,
    footnoteItem,
  },
  tags: {
    spacer,
    header,
    nav,
    section,
  },
  partials: {
    "meta.md": parse(Helpers.getContent("partials/meta")),
    "article-title.md": parse(Helpers.getContent("partials/article-title")),
  },
  variables: {},
} as ConfigType;
