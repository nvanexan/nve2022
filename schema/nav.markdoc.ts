import { Config, Node, Tag } from "@markdoc/markdoc";

export const nav = {
  render: "nav",
  description: "Create a nav container",
  children: ["heading", "paragraph"],
  attributes: {},
  transform: (node: Node, config: Config) => {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Tag(`nav`, attributes, children);
  },
};
