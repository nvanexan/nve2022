import { Config, Node, Tag } from "@markdoc/markdoc";
import Helpers from "../../lib/helpers";

export const diagram = {
  // render: "nve-diagram",
  description: "Create a diagram container",
  attributes: {
    src: { type: String, required: true },
    alt: { type: String },
  },
  transform: (node: Node, config: Config) => {
    const attributes = node.transformAttributes(config);
    const svgdata = Helpers.getPublicFileSync(
      attributes.src.replace("/public/", "")
    );
    attributes.svgdata = svgdata;
    return new Tag(`nve-diagram`, attributes);
  },
};
