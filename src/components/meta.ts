export class Meta extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `<slot></slot>`;
  }
}
