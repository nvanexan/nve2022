import { Config, Node, Tag } from "@markdoc/markdoc";

export const text = {
  attributes: {
    content: { type: String, required: true },
  },
  transform(node: Node) {
    return node.attributes.content;
  },
};
