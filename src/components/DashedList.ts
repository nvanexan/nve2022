import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";

export class DashedList extends LitElement {
  static styles = css`
    ::slotted(ul) {
      list-style: none;
      list-style-position: outside;
      margin: 0 0 1rem 1rem;
      padding: 0;
      border: red;
    }

    ::slotted(ul) li:before {
      content: "–";
      display: inline-block;
      text-indent: calc(1rem * -1);
    }
  `;

  @property()
  class?: string = "dashed-list";

  constructor() {
    super();
  }

  render() {
    return html`<slot class="${this.class}"></slot>`;
  }
}
