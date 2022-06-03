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
      const token = this.endNotePattern.exec(fn[0].attributes.content);
      if (token) {
        // Remove the markdown footnote syntax (e.g. [^1]) from the string
        fn[0].attributes.content = fn[0].attributes.content.replace(
          token[0],
          ""
        );
        // Create a new footnote item and append to the fnList
        const id = token[1];
        const fnItem = new Ast.Node(
          "footnoteItem",
          {
            id: `fn${id}`,
            href: `#fnref${id}`,
          },
          fn
        );
        fnList.push(fnItem);
      }
    }
    ast.children.pop(); // remove the last paragraph in the doc being replaced by the fnList
    ast.push(fnList);
  }

  private processFootnoteRefs(ast: Node) {
    let parent: Node = ast;
    let count: number = 0;
    for (const node of ast.walk()) {
      if (node.attributes.content) {
        // Check if there's a footnote ref token
        const token = this.inlineFnPattern.exec(node.attributes.content);
        if (token) {
          // Break the string where the foonote ref is, assign first part of string to the current node content
          const [prevText, nextText] = node.attributes.content.split(token[0]);
          node.attributes.content = prevText;

          // Create a footnote node and insert it in the tree
          const id = token[1];
          const fn = new Ast.Node("footnoteRef", {
            id: `fnref${id}`,
            href: `#fn${id}`,
            label: `${id}`,
          });
          parent.children = this.insertAt(parent.children, fn, count);

          // Create a text node for the text which follows after the footnote and insert it in the tree
          if (nextText) {
            count += 1;
            const next = new Ast.Node("text", { content: nextText });
            parent.children = this.insertAt(parent.children, next, count);
          }
        }
      }
      // If the node is of inline type, update parent
      if (node.type == "inline") {
        parent = node;
        count = 0;
      }
      count += 1;
    }
  }

  private insertAt(nodes: Node[], nodeToInsert: Node, index: number) {
    return [...nodes.slice(0, index), nodeToInsert, ...nodes.slice(index)];
  }
}

export default Parser;
