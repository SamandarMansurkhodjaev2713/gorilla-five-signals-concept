const PRODUCT_IMAGE_SELECTOR = "[data-product-card] img";
const PRELOAD_ROOT_MARGIN = "100% 0px";

export interface ProductExplorerMediaPreloader {
  destroy(): void;
}

function decodeImage(image: HTMLImageElement): void {
  image.loading = "eager";
  void image.decode().then(
    (): void => {
      image.dataset.decodeStatus = "ready";
    },
    (): void => {
      image.dataset.decodeStatus = "fallback";
    },
  );
}

export function createProductExplorerMediaPreloader(
  root: HTMLElement,
): ProductExplorerMediaPreloader {
  const images = [
    ...root.querySelectorAll<HTMLImageElement>(PRODUCT_IMAGE_SELECTOR),
  ];
  let observer: IntersectionObserver | null = null;
  const decodeAll = (): void => {
    observer?.disconnect();
    observer = null;
    images.forEach(decodeImage);
  };

  if (images.length === 0 || globalThis.IntersectionObserver === undefined) {
    decodeAll();
  } else {
    observer = new IntersectionObserver(
      (entries): void => {
        if (entries.some((entry) => entry.isIntersecting)) {
          decodeAll();
        }
      },
      { rootMargin: PRELOAD_ROOT_MARGIN },
    );
    observer.observe(root);
  }

  return { destroy: (): void => observer?.disconnect() };
}
