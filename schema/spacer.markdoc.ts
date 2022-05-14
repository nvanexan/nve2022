import { Config, Node, Tag } from "@markdoc/markdoc";

export const spacer = {
  render: "span",
  description: "Create a spacer span",
  selfClosing: true,
  attributes: {
    size: {
      type: Number,
    },
  },
  transform: (node: Node, config: Config) => {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    attributes.class = "spacer";
    if (attributes.size) {
      attributes.style = `--spacer-y: ${attributes.size};`;
      delete attributes.size;
    }
    return new Tag(`span`, attributes, children);
  },
};
