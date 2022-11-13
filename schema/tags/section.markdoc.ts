import { Config, Node, Tag } from "@markdoc/markdoc";

export const section = {
  render: "section",
  description: "Create a section container",
  children: ["heading", "paragraph", "list", "item", "tag", "text"],
  attributes: {},
  transform: (node: Node, config: Config) => {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Tag(`section`, attributes, children);
  },
};
