import {
  LINK_SELECTOR,
  NAV_SELECTOR,
  PANEL_SELECTOR,
  STATUS_SELECTOR,
  type AtlasElements,
} from "./product-atlas-contract";

export function productSlug(element: HTMLElement): string | null {
  const slug = element.dataset.productSlug;
  return slug === undefined || slug.length === 0 ? null : slug;
}

function hasMatchingSlugs(
  links: readonly HTMLAnchorElement[],
  panels: readonly HTMLElement[],
): boolean {
  return links.every(
    (link, index) => productSlug(link) === productSlug(panels[index] ?? link),
  );
}

export function collectAtlasElements(root: HTMLElement): AtlasElements | null {
  const panels = Array.from(root.querySelectorAll<HTMLElement>(PANEL_SELECTOR));
  const links = Array.from(
    root.querySelectorAll<HTMLAnchorElement>(LINK_SELECTOR),
  );
  const nav = root.querySelector<HTMLElement>(NAV_SELECTOR);
  const status = root.querySelector<HTMLElement>(STATUS_SELECTOR);

  if (
    panels.length === 0 ||
    panels.length !== links.length ||
    nav === null ||
    status === null ||
    !hasMatchingSlugs(links, panels)
  ) {
    return null;
  }

  return { links, nav, panels, root, status };
}
