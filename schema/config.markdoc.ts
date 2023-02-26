import { ConfigType } from "@markdoc/markdoc";
import { spacer } from "./tags/spacer.markdoc";
import { header } from "./tags/header.markdoc";
import { link } from "./nodes/link.markdoc";
import { nav } from "./tags/nav.markdoc";
import { section } from "./tags/section.markdoc";
import { text } from "./nodes/text.markdoc";
import { paragraph } from "./nodes/paragraph.markdoc";
import { image } from "./nodes/image.markdoc";
import { fence } from "./nodes/fence.markdoc";
import { footnoteRef } from "./nodes/footnoteRef.markdoc";
import { footnoteItem } from "./nodes/footnoteItem.markdoc";
import { inline } from "./nodes/inline.markdoc";
import { list } from "./nodes/list.markdoc";
import { heading } from "./nodes/heading.markdoc";
import { mark } from "./nodes/mark.markdoc";
import { diagram } from "./tags/diagram.markdoc";

export const config = {
  nodes: {
    link,
    text,
    paragraph,
    heading,
    image,
    fence,
    inline,
    list,
    footnoteRef,
    footnoteItem,
    mark,
  },
  tags: {
    spacer,
    header,
    nav,
    section,
    diagram,
  },
  functions: {},
  partials: {},
  variables: {},
} as ConfigType;
