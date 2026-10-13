const PRESENTATION_SELECTOR =
  "[data-world-copy], [data-world-art], [data-world-can-media]";
const PRESENTATION_PROPERTIES = [
  "opacity",
  "rotate",
  "scale",
  "transform",
  "translate",
  "visibility",
  "will-change",
] as const;

/** Removes only motion-owned presentation properties from product-world hooks. */
export function resetProductWorldPresentation(root: HTMLElement): void {
  const targets = root.querySelectorAll<HTMLElement>(PRESENTATION_SELECTOR);

  for (const target of targets) {
    for (const property of PRESENTATION_PROPERTIES) {
      target.style.removeProperty(property);
    }
    if (target.getAttribute("style")?.trim() === "") {
      target.removeAttribute("style");
    }
  }
}
