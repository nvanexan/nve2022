import { Config, Node, Tag } from "@markdoc/markdoc";

export const mark = {
  attributes: {
    content: { type: String, required: true },
  },
  transform(node: Node, config: Config) {
    const attributes = node.transformAttributes(config);
    const { content, ...rest } = attributes;
    return new Tag(`mark`, rest, [content]);
  },
};
