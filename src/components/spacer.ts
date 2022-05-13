import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

export class Spacer extends LitElement {
  @property()
  size?: number = 5.25;

  @property()
  styles = css`
    :host {
      --spacer-y: ${this.size as any};
    }
  `;

  constructor() {
    super();
  }

  render() {
    return html`<span style=${styleMap(this.styles as any)}></span>`;
  }
}
