import { Config, Node, RenderableTreeNode, Tag } from "@markdoc/markdoc";

function generateID(
  children: RenderableTreeNode[],
  attributes: Record<string, any>
) {
  if (attributes.id && typeof attributes.id === "string") {
    return attributes.id;
  }
  return children
    .filter((child: RenderableTreeNode) => typeof child === "string")
    .join(" ")
    .trim()
    .replace(/[?]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export const heading = {
  children: ["inline"],
  attributes: {
    id: { type: String },
    level: { type: Number, required: true, default: 1 },
  },
  transform(node: Node, config: Config) {
    const attributes = node.transformAttributes(config);
    attributes.class = "heading";
    const children = node.transformChildren(config);
    const { level, ...rest } = attributes;
    const id = generateID(children, attributes);
    const link = new Tag(
      "a",
      { href: `#${id}`, class: "heading-link" },
      children
    );

    return new Tag(`h${level}`, { ...rest, id }, [link]);
  },
};
