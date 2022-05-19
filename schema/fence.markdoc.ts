import { Config, Node, Tag } from "@markdoc/markdoc";

export const fence = {
  description: "Create a code block",
  attributes: {
    content: { type: String, render: false, required: true },
    language: { type: String, render: "data-language" },
    process: { type: Boolean, render: false, default: true },
    class: { type: String, render: true },
  },
  transform(node: Node, config: Config) {
    const attributes = node.transformAttributes(config);
    attributes.class = `language-${attributes["data-language"]}`;
    const children =
      node.attributes.language === "markdoc"
        ? node.attributes.content
        : node.transformChildren(config);

    const code = new Tag("code", attributes, children);
    const pre = new Tag("pre", attributes, [code]);

    return pre;
  },
};
