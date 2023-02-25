export class NveToc extends HTMLElement {
  container = null as HTMLElement | null;
  observer = new IntersectionObserver(this.handleIntersect.bind(this), {
    rootMargin: "0px",
    threshold: [0.1, 1.0],
  });
  linkedHeadings = {} as any;
  timer = null as any;

  constructor() {
    super();
    let shadow = this.shadowRoot;

    // check for a Declarative Shadow Root
    // see https://developer.chrome.com/articles/declarative-shadow-dom/
    if (!shadow) {
      // there wasn't one. create a new Shadow Root:
      shadow = this.attachShadow({ mode: "open" });
      const template = document.getElementById(
        "nve-toc-template"
      ) as HTMLTemplateElement;
      shadow.appendChild(template.content.cloneNode(true));
    }

    // Store a reference to the containing div for easy of use later
    this.container = shadow.querySelector(".nve-toc-container");

    // Create the TOC list based on the page headings
    const list = document.createElement("ul");
    const headings = document.querySelectorAll(".heading");
    headings.forEach((h, k) => {
      this.linkedHeadings[h.id] = {
        prev: k > 0 ? headings.item(k - 1).id : null,
        next: k < headings.length - 1 ? headings.item(k + 1) : null,
      };
      const listitem = document.createElement("li");
      const link = document.createElement("a");
      link.setAttribute("href", `#${h.id}`);
      const linkLabel = document.createTextNode(h.textContent || "");
      link.appendChild(linkLabel);
      listitem.appendChild(link);
      list.appendChild(listitem);
      this.observer.observe(h);
    });

    this.container?.appendChild(list);
  }

  /*
    Callback method for handling intersection observations
    See https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API 
  */

  handleIntersect(entries: IntersectionObserverEntry[], observer: any) {
    entries.forEach((entry) => {
      if (!this.container) return;
      const nodeName = entry.target.nodeName.toLowerCase();
      // If the item being intersected is the H1, this controls display of the TOC
      // Show the TOC if H1 isIntersecting is false (i.e. is hidden); if visible, hide the TOC because we're at the top of the page
      if (nodeName === "h1") {
        this.container.style.display = entry.isIntersecting ? "none" : "block";
      }
      // For any heading, update whether it is visible or hidden depending on isIntersecting
      if (entry.isIntersecting === false) {
        entry.target.classList.add("hidden");
      } else {
        entry.target.classList.remove("hidden");
      }
    });
  }

  /*
    Callback method for updating the className of the TOC links  
  */
  updateLinks(): void {
    if (!this.container) return;

    let currentSectionId = "";

    // get the current section: first see if there's a visible heading on the page
    const firstVisibleHeading = document.querySelector(".heading:not(.hidden)");
    if (firstVisibleHeading) {
      if (this.linkedHeadings[firstVisibleHeading.id].next === null) {
        currentSectionId = firstVisibleHeading.id;
      } else {
        const pos = firstVisibleHeading.getBoundingClientRect();
        currentSectionId =
          pos.top < 150
            ? firstVisibleHeading.id
            : this.linkedHeadings[firstVisibleHeading.id].prev;
      }
    }

    // if there's still no current section, it's because the user is in between sections
    // so find the nearest header and make that the current section
    if (!currentSectionId) {
      const headings = Array.from(document.querySelectorAll(".heading"));
      for (let h of headings) {
        currentSectionId = h.id;
        const pos = h.getBoundingClientRect();
        // if item is below the top of the viewport, go to the next item
        if (pos.top < 0) continue;
        // if item is below the bottom of the viewport, make current item the previous one
        if (pos.top > window.innerHeight) {
          currentSectionId = this.linkedHeadings[h.id].prev;
        }
        break;
      }
    }

    // Update the links so that the item pointing to the currentSection has an active class
    const links = this.container.querySelectorAll("a");
    links.forEach(
      (l) => (l.className = l.hash === `#${currentSectionId}` ? "active" : "")
    );
  }

  /*
    Debounce detect when scrolling is finished and update the link styles 
    Need to do this to ensure active link is correct in case anything changed between intersection event and completion of user scrolling
  */
  handleScrollEvent(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      // Scrolling has finished, update the styles of the toc links
      this.updateLinks();
    }, 150);
  }

  // on web-component connection, setup listeners
  connectedCallback() {
    this.updateLinks();
    window.addEventListener("scroll", this.handleScrollEvent.bind(this));
  }

  // on web-component disconnect, remove listeners
  disconnectedCallback() {
    this.observer.disconnect();
    window.removeEventListener("scroll", this.handleScrollEvent.bind(this));
  }
}
