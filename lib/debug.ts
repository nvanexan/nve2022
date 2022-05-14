import Markdoc, { Node } from "@markdoc/markdoc";

function printNodeAttributes(ast: Node) {
  if (ast.type === "link") {
    console.log(`Node type: ${ast.type}`);
    console.log(`Node attributes: ${JSON.stringify(ast.attributes)}`);
  }
  if (ast.children) {
    ast.children.forEach((child) => printNodeAttributes(child));
  }
}

const testLink = `[Markdoc](https://markdoc.io "markdoc link title")`;
const ast = Markdoc.parse(testLink);
printNodeAttributes(ast);
