const ELEMENT_NAME = "product-packshot";
const IMAGE_SELECTOR = "[data-packshot-image]";

type PackshotState = "loading" | "ready" | "failed";

function imageState(image: HTMLImageElement): PackshotState {
  if (!image.complete) {
    return "loading";
  }
  return image.naturalWidth > 0 ? "ready" : "failed";
}

class ProductPackshotElement extends HTMLElement {
  private controller: AbortController | null = null;

  connectedCallback(): void {
    this.controller?.abort();
    this.controller = new AbortController();
    const image = this.querySelector<HTMLImageElement>(IMAGE_SELECTOR);
    if (image === null) {
      this.dataset.mediaState = "failed";
      return;
    }

    image.addEventListener("load", (): void => this.setState("ready"), {
      signal: this.controller.signal,
    });
    image.addEventListener("error", (): void => this.setState("failed"), {
      signal: this.controller.signal,
    });
    this.setState(imageState(image));
  }

  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }

  private setState(state: PackshotState): void {
    this.dataset.mediaState = state;
  }
}

if (!customElements.get(ELEMENT_NAME)) {
  customElements.define(ELEMENT_NAME, ProductPackshotElement);
}
