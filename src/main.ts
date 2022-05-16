// import { Meta } from "./components/meta";
// import { Spacer } from "./components/spacer";

// // Define your components below
// customElements.define("nve-spacer", Spacer);
// customElements.define("nve-meta", Meta);

const mediaQuery = window.matchMedia("(max-width: 1024px)");

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
  console.log(`run ${timesRun}`);
  if (imagesLoaded === imageCount || timesRun >= 10) {
    clearInterval(intervalId);
    setFootnotePositions();
  }
  timesRun++;
}

function setFootnotePositions() {
  const container = document.getElementById("footnotes");
  //
  if (mediaQuery.matches) {
    (container as HTMLElement).setAttribute("class", "footnotes");
  } else {
    (container as HTMLElement).setAttribute("class", "footnotes footnotes-js");
  }
  //
  const footnotes = document.querySelectorAll("#footnotes p");
  footnotes.forEach((elem) => {
    const id = elem.id.replace("fn-", "");
    const fnRef = document.getElementById(`fnref-${id}`);
    const containerTop = fnRef?.parentElement?.offsetTop;
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

const intervalId = setInterval(checkImagesLoaded, 10);

window.addEventListener("resize", setFootnotePositions);
