export class Diagram extends HTMLElement {
  lightsvg = "";
  darksvg = "";
  listener: any = undefined;

  constructor() {
    super();

    if (this.multimode) {
      this.lightsvg = this.light;
      this.darksvg = this.dark;

      this.svgdata = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? this.darksvg
        : this.lightsvg;
    }
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

  set multimode(value) {
    this.setAttribute("multimode", `${value}`);
  }

  get multimode() {
    return this.getAttribute("multimode") || "";
  }

  set dark(value) {
    this.setAttribute("dark", `${value}`);
  }

  get dark() {
    return this.getAttribute("dark") || "";
  }

  set light(value) {
    this.setAttribute("light", `${value}`);
  }

  get light() {
    return this.getAttribute("light") || "";
  }

  handleColorSchemeChange(figure: HTMLElement) {
    return (event: any) => {
      const newColorScheme = event.matches ? "dark" : "light";

      switch (newColorScheme) {
        case "dark":
          figure.innerHTML = this.darksvg;
          break;
        case "light":
          figure.innerHTML = this.lightsvg;
          break;
        default:
          break;
      }

      this.addFigCaption(figure);
    };
  }

  addFigCaption(figure: HTMLElement) {
    if (this.alt) {
      const figcaption = document.createElement("figcaption");
      figcaption.textContent = this.alt;
      figure.appendChild(figcaption);
    }
  }

  connectedCallback() {
    const figure = document.createElement("figure");
    figure.className = this.multimode ? "diagram" : "diagram unimode";
    figure.innerHTML = this.svgdata;
    this.addFigCaption(figure);

    // add event listener
    if (this.multimode) {
      this.listener = this.handleColorSchemeChange(figure);
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", this.listener);
    }

    // cleanup
    this.removeAttribute("svgdata");
    this.removeAttribute("dark");
    this.removeAttribute("light");
    this.removeAttribute("src");

    // Append to dom
    this.appendChild(figure);
  }

  disconnectedCallback() {
    if (this.listener) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", this.listener);
    }
  }
}
