import { Config, Node, Tag } from "@markdoc/markdoc";

export const link = {
  children: ["strong", "em", "s", "code", "text", "tag"],
  attributes: {
    href: { type: String, required: true },
    title: { type: String },
  },
  transform: (node: Node, config: Config) => {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Tag(`a`, attributes, children);
  },
};
