import { ConfigType, parse } from "@markdoc/markdoc";
import { parseFrontMatter } from "../lib/build";
import { getContent } from "../lib/helpers";
import { spacer } from "./spacer.markdoc";

export const config = {
  tags: {
    spacer,
  },
  partials: {
    "header.md": parse(getContent("partials/header")),
  },
} as ConfigType;
