import { Config, Node, Tag } from "@markdoc/markdoc";

export const list = {
  children: ["item", "footnoteItem"],
  attributes: {
    ordered: { type: Boolean, render: false, required: true },
  },
  transform(node: Node, config: Config) {
    return new Tag(
      node.attributes.ordered ? "ol" : "ul",
      node.transformAttributes(config),
      node.transformChildren(config)
    );
  },
};
