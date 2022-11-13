import { Config, Tag, Node } from "@markdoc/markdoc";

export const paragraph = {
  render: "p",
  children: ["inline", "footnote_ref"],
  attributes: {
    width: { type: Number },
    height: { type: Number },
  },
  transform(node: Node, config: Config) {
    if (node.attributes.width && node.attributes.height) {
      const imageNode = node.children[0].children.filter(
        (node) => node.type === "image"
      )[0];
      imageNode.attributes.width = node.attributes.width;
      imageNode.attributes.height = node.attributes.height;
      delete node.attributes.width;
      delete node.attributes.height;
    }
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);

    return new Tag(`p`, attributes, children);
  },
};
