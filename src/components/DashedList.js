class DashedList extends HTMLElement {
  constructor() {
    super();
  }

  render() {
    return html`<div class="dashed-list"><slot></slot></div>`;
  }
}

export default DashedList;
