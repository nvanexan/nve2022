import { Config, Node, RenderableTreeNode, Tag } from "@markdoc/markdoc";

export const image = {
  render: "img",
  attributes: {
    src: { type: String, required: true },
    alt: { type: String },
    width: { type: Number },
    height: { type: Number },
  },
  transform(node: Node, config: Config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Tag(`img`, attributes, children);
  },
};
