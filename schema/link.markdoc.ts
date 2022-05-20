import { Config, Node, Tag } from "@markdoc/markdoc";

export const link = {
  children: ["strong", "em", "s", "code", "text", "tag"],
  attributes: {
    href: { type: String, required: true },
    title: { type: String },
    target: { type: String },
  },
  transform: (node: Node, config: Config) => {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    const match = attributes.href.match(/https?:\/\/(\S*)\.([a-z]*)/m);
    if (match && match[1] && !match[1].includes("vanexan")) {
      attributes.target = "_blank";
    }
    return new Tag(`a`, attributes, children);
  },
};
