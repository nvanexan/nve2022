import { Config, Node, RenderableTreeNode, Tag } from "@markdoc/markdoc";

export const image = {
  render: "img",
  attributes: {
    src: { type: String, required: true },
    alt: { type: String },
    title: { type: String },
    width: { type: Number },
    height: { type: Number },
  },
  transform(node: Node, config: Config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    const img = new Tag(`img`, attributes, children);
    const container = new Tag(`div`, { class: "image-container" }, [img]);
    if (!attributes.title) return container;
    // If there's a title, return a figure tag with image and figure caption for better accessibility
    const figcaption = new Tag(`figcaption`, {}, [attributes.title]);
    const figure = new Tag(`figure`, { class: "image-container" }, [
      img,
      figcaption,
    ]);
    return figure;
  },
};
