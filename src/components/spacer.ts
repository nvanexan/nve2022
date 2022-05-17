const getTemplate = (size: number) =>
  `
  <style>
  .spacer {
    display: block;
    margin-top: calc(var(--default-gap) * ${size} - 1px);
    margin-bottom: 0;
  }
  </style>
  <span class="spacer"></span>
  `;

export class Spacer extends HTMLElement {
  constructor() {
    super();
  }

  set size(value) {
    this.setAttribute("size", `${value}`);
  }

  get size() {
    return Number(this.getAttribute("size"));
  }

  connectedCallback() {
    this.innerHTML = `<span class="spacer"></span>`;
  }
}
