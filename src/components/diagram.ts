export class Diagram extends HTMLElement {
  constructor() {
    super();
  }

  set svgdata(value) {
    this.setAttribute("svgdata", `${value}`);
  }

  get svgdata() {
    return this.getAttribute("svgdata") || "";
  }

  set alt(value) {
    this.setAttribute("alt", `${value}`);
  }

  get alt() {
    return this.getAttribute("alt") || "";
  }

  connectedCallback() {
    const figure = document.createElement("figure");
    figure.className = "diagram";
    figure.innerHTML = this.svgdata;

    this.appendChild(figure);
    this.removeAttribute("svgdata"); //cleanup
  }
}
