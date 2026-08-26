import {
  DESKTOP_SLOT_LIMIT,
  MOBILE_SLOT_LIMIT,
  PRODUCT_PARAMETER,
  type CompareViewport,
} from "./compare-contract";

export function isPresent(value: string | undefined): value is string {
  return value !== undefined && value.length > 0;
}

export function slotLimitForViewport(viewport: CompareViewport): number {
  return viewport === "desktop" ? DESKTOP_SLOT_LIMIT : MOBILE_SLOT_LIMIT;
}

export function uniqueValidSlugs(
  values: readonly string[],
  validSlugs: ReadonlySet<string>,
  limit: number,
): readonly string[] {
  if (limit <= 0) {
    return [];
  }

  const selected: string[] = [];
  for (const value of values) {
    if (value !== "" && validSlugs.has(value) && !selected.includes(value)) {
      selected.push(value);
    }
    if (selected.length === limit) {
      break;
    }
  }
  return selected;
}

export function selectionFromUrl(
  url: URL,
  defaults: readonly string[],
  validSlugs: ReadonlySet<string>,
  limit: number,
): readonly string[] {
  if (!url.searchParams.has(PRODUCT_PARAMETER)) {
    return defaults.slice(0, Math.max(0, limit));
  }

  const parameter = url.searchParams.get(PRODUCT_PARAMETER);
  return uniqueValidSlugs(
    parameter === null ? [] : parameter.split(","),
    validSlugs,
    limit,
  );
}

export function createShareUrl(
  locationUrl: string | URL,
  selection: readonly string[],
): URL {
  const url = new URL(locationUrl);
  url.searchParams.set(PRODUCT_PARAMETER, selection.join(","));
  return url;
}

export function createFindHref(
  findBase: string,
  origin: string,
  selection: readonly string[],
): string {
  const url = new URL(findBase, origin);
  const firstProduct = selection[0];
  if (firstProduct !== undefined) {
    url.searchParams.set("product", firstProduct);
  }
  return `${url.pathname}${url.search}`;
}
