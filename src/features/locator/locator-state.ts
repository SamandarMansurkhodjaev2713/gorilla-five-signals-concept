import { LOCATOR_PRODUCT_QUERY_KEY } from "./locator-contract";

export function resolveLocatorSlug(
  optionValues: readonly string[],
  href: string,
): string {
  const requested =
    new URL(href).searchParams.get(LOCATOR_PRODUCT_QUERY_KEY) ?? "";
  return optionValues.includes(requested) ? requested : "";
}

export function createLocatorUrl(href: string, slug: string): URL {
  const url = new URL(href);
  if (slug === "") {
    url.searchParams.delete(LOCATOR_PRODUCT_QUERY_KEY);
  } else {
    url.searchParams.set(LOCATOR_PRODUCT_QUERY_KEY, slug);
  }
  return url;
}

export function hasMatchingLocatorSlugs(
  optionValues: readonly string[],
  signalValues: readonly string[],
  visualValues: readonly string[],
): boolean {
  const productOptions = optionValues.filter((value) => value !== "");
  const expected = new Set(productOptions);
  const signals = new Set(signalValues);
  const visuals = new Set(visualValues);
  return (
    expected.size === productOptions.length &&
    expected.size > 0 &&
    expected.size === signals.size &&
    expected.size === visuals.size &&
    productOptions.every((slug) => signals.has(slug) && visuals.has(slug))
  );
}
