import { Config, Node, Tag } from "@markdoc/markdoc";
import Helpers from "../../lib/helpers";
import { ConfigWithBuildMode } from "../../lib/compiler";

export const diagram = {
  // render: "nve-diagram",
  description: "Create a diagram container",
  attributes: {
    src: { type: String, required: true },
    alt: { type: String },
    multimode: { type: Boolean },
  },
  transform: (node: Node, config: ConfigWithBuildMode) => {
    const attributes = node.transformAttributes(config);
    if (config.buildMode === "RSS") {
      return new Tag(`img`, {
        src: `${Helpers.BASE_URL}${attributes.src.replace(
          /(\.[\w\d_-]+)$/i,
          "_rss.png"
        )}`,
        style: "width: 100%; height: auto;",
      });
    }
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
