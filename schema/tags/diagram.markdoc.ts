import { Config, Node, Tag } from "@markdoc/markdoc";
import Helpers from "../../lib/helpers";

export const diagram = {
  // render: "nve-diagram",
  description: "Create a diagram container",
  attributes: {
    src: { type: String, required: true },
    alt: { type: String },
    multimode: { type: Boolean },
  },
  transform: (node: Node, config: Config) => {
    const attributes = node.transformAttributes(config);
    if (attributes.multimode) {
      attributes.light = Helpers.getPublicFileSync(
        attributes.src
          .replace("/public/", "")
          .replace(/(\.[\w\d_-]+)$/i, "_light$1")
      );
      attributes.dark = Helpers.getPublicFileSync(
        attributes.src
          .replace("/public/", "")
          .replace(/(\.[\w\d_-]+)$/i, "_dark$1")
      );
      attributes.svgdata = attributes.dark;
    } else {
      attributes.svgdata = Helpers.getPublicFileSync(
        attributes.src.replace("/public/", "")
      );
    }

    return new Tag(`nve-diagram`, attributes);
  },
};
