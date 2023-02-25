import { Diagram } from "./components/diagram";
import { NveToc } from "./components/nve-toc";

// // Define your components below
customElements.define("nve-diagram", Diagram);
customElements.define("nve-toc", NveToc);

function debounce(func: any, time: number = 100) {
  let timer: any;
  return function (event: any) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, time, event);
  };
}

const mediaQuery = window.matchMedia("(max-width: 1100px)");

const images = document.querySelectorAll("article img");
const imageCount = images.length;
let imagesLoaded = 0;
let timesRun = 0;

images.forEach((elem) => {
  elem.addEventListener("load", () => {
    imagesLoaded += 1;
  });
});

function checkImagesLoaded() {
  if (imagesLoaded === imageCount || timesRun >= 10) {
    clearInterval(intervalId);
    setFootnotePositions();
  }
  timesRun++;
}

const fnContainer = document.getElementsByClassName("footnotes").item(0);

function setFootnotePositions() {
  if (fnContainer) {
    if (mediaQuery.matches) {
      (fnContainer as HTMLElement).setAttribute("class", "footnotes");
    } else {
      (fnContainer as HTMLElement).setAttribute(
        "class",
        "footnotes footnotes-js"
      );
    }
    const footnotes = document.querySelectorAll(".footnotes li");
    footnotes.forEach((elem) => {
      const id = elem.id.replace("fn", "");
      const fnRef = document.getElementById(`fnref${id}`);
      let containerTop = fnRef?.parentElement?.parentElement?.offsetTop;
      let top;
      if (!elem.previousElementSibling) {
        top = containerTop;
      } else {
        const prevSiblingRect =
          elem.previousElementSibling.getBoundingClientRect();
        const prevSiblingBottom =
          prevSiblingRect.y + prevSiblingRect.height + window.scrollY;
        top =
          prevSiblingBottom && prevSiblingBottom > (containerTop as number)
            ? prevSiblingBottom
            : containerTop;
      }
      (elem as HTMLElement).style.top = mediaQuery.matches ? "0px" : `${top}px`;
    });
  }
}

const intervalId = setInterval(checkImagesLoaded, 10);

if (fnContainer) {
  window.addEventListener("resize", debounce(setFootnotePositions, 150));
}
