import Markdoc, { Ast, Node } from "@markdoc/markdoc";

class Parser {
  private endNotePattern = /\[\^(\d+)\]:\s/m;
  private inlineFnPattern = /\[\^(\d+)\](?!:)/gm;

  constructor() {}

  public parse(source: string) {
    const ast = Markdoc.parse(source);
    this.processFootnoteRefs(ast);
    this.processFootnotes(ast);
    return ast;
  }

  private *getFootnoteItemNodes(nodes: Node[]) {
    let results = [];
    let itemsProcessed = 0;
    for (const n of nodes) {
      itemsProcessed += 1;
      if (n.type !== "softbreak") results.push(n);
      if (n.type === "softbreak" || itemsProcessed === nodes.length) {
        yield results;
        results = [];
      }
    }
  }

  private findFootnoteContainerNode(ast: Node) {
    const generator = ast.walk();
    let container: Node | undefined;
    let match = false;
    for (const node of generator) {
      if (
        node.attributes.content &&
        this.endNotePattern.test(node.attributes.content)
      ) {
        match = true;
        generator.return();
      }
      if (node.type === "inline") container = node;
    }
    return match ? container : undefined;
  }

  private processFootnotes(ast: Node) {
    // Get a refrence to the node containing endNotes; if not present, early return
    const fnContainerNode = this.findFootnoteContainerNode(ast);
    if (!fnContainerNode) return;
    // We have footnotes, so create a new list node which will contain the list of endNotes
    const fnList = new Ast.Node("list", {
      ordered: true,
      class: "footnotes",
    });
    // Get the children nodes for each footnote item
    const fnItems = this.getFootnoteItemNodes(fnContainerNode.children);
    for (const fn of fnItems) {
      const match = this.endNotePattern.exec(fn[0].attributes.content);
      if (match) {
        const token = match[0];
        const id = match[1];
        fn[0].attributes.content = fn[0].attributes.content.replace(token, "");
        const anchor = new Ast.Node(
          "link",
          { class: "footnote-anchor", href: `#fnref${id}` },
          [new Ast.Node("text", { content: "↩" })]
        );
        fn.push(anchor);
        const inline = new Ast.Node("inline", {}, fn);
        const fnItem = new Ast.Node(
          "item",
          { id: `fn${id}`, class: "footnote-item" },
          [inline]
        );
        fnList.push(fnItem);
      }
    }
    ast.children.pop();
    ast.push(fnList);
  }

  private processFootnoteRefs(ast: Node) {
    let parent: Node = ast;
    for (const node of ast.walk()) {
      if (node.attributes.content) {
        // Check if there's a footnote ref token
        const token = this.inlineFnPattern.exec(node.attributes.content);
        if (token) {
          // Break the string where the foonote ref is, assign prev to current node content
          const [prevText, nextText] = node.attributes.content.split(token[0]);
          node.attributes.content = prevText;

          // Create a footnote node
          const id = token[1];
          const fn = new Ast.Node("footnote_ref", {
            id: `fnref${id}`,
            href: `#fn${id}`,
            label: `${id}`,
          });
          parent.push(fn);

          // Create a text node which follows after the footnote
          const next = new Ast.Node("text", { content: nextText });
          parent.push(next);
        }
      }
      // If the node is of inline type, update parent
      if (node.type == "inline") parent = node;
    }
  }
}

export default Parser;
