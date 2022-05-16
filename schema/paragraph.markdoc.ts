import { Config, Node, RenderableTreeNode, Tag } from "@markdoc/markdoc";

const endNotePattern = /\[\^(\d+)\]: /gm;
const inlineFnPattern = /\[\^(\d+)\] /gm;

function getFootnoteId(nodeChildren: RenderableTreeNode[]) {
  let id;
  const children = nodeChildren.flatMap((node) => {
    if (typeof node !== "string") return node;
    const match = node.match(endNotePattern);
    if (match) {
      node = node.replace(endNotePattern, "");
      id = match[0].replace("[^", "").replace("]: ", "").trim();
    }
    return node;
  });
  const backLink = new Tag(
    "a",
    { class: "footnote-backref", href: `#fnref-${id}` },
    ["↩"]
  );
  return [id, [...children, backLink]];
}

function parseFootnotes(str: string) {
  return str
    .replace(inlineFnPattern, `,$&, `)
    .split(",")
    .flatMap((str) => {
      const matches = str.match(inlineFnPattern);
      if (!matches) return str;
      const id = str.replace("[^", "").replace("]", "").trim();
      const link = new Tag("a", { class: "footnote-ref", href: `#fn-${id}` }, [
        `${id}`,
      ]);
      return new Tag(`sup`, { id: `fnref-${id}` }, [link]);
    });
}

function transformFootnotes(nodeChildren: RenderableTreeNode[]) {
  return nodeChildren.flatMap((node) => {
    if (typeof node !== "string") return node;
    return parseFootnotes(node as string);
  });
}

export const paragraph = {
  render: "p",
  children: ["inline"],
  attributes: {
    width: { type: Number },
    height: { type: Number },
  },
  transform(node: Node, config: Config) {
    let childrenToUse: any;
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
    childrenToUse = transformFootnotes(children);
    console.log(childrenToUse);
    const [fnId, nodeChildren] = getFootnoteId(childrenToUse);
    if (fnId) {
      attributes.id = `fn-${fnId}`;
      childrenToUse = nodeChildren;
    }

    return new Tag(`p`, attributes, childrenToUse);
  },
};
