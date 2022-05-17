import { Config, Node, Tag } from "@markdoc/markdoc";

export const header = {
  render: "header",
  description: "Create a header container",
  children: ["heading", "paragraph"],
  attributes: {},
  transform: (node: Node, config: Config) => {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Tag(`header`, attributes, children);
  },
};
