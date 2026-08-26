import { DEFAULT_LOCATOR_FLAVOR } from "./locator-contract";

export const DEFAULT_LOCATOR_LABEL = "Gorilla Energy";
const LOCATOR_CITY_NAME = "Tashkent";
const GOOGLE_MAPS_SEARCH_URL =
  "https://www.google.com/maps/search/?api=1&query=";
const YANDEX_MAPS_SEARCH_URL = "https://yandex.uz/maps/10335/tashkent/search/";

export interface LocatorPresentation {
  readonly flavor: string;
  readonly googleUrl: string;
  readonly selection: "product" | "range";
  readonly status: string;
  readonly yandexUrl: string;
}

/** Builds the honest map-search handoff shared by server and client renders. */
export function createLocatorPresentation(
  label: string,
  slug: string,
): LocatorPresentation {
  const resolvedLabel = label.trim() || DEFAULT_LOCATOR_LABEL;
  const query = `${resolvedLabel} ${LOCATOR_CITY_NAME}`;
  const encodedQuery = encodeURIComponent(query);

  return {
    flavor: slug || DEFAULT_LOCATOR_FLAVOR,
    googleUrl: `${GOOGLE_MAPS_SEARCH_URL}${encodedQuery}`,
    selection: slug === "" ? "range" : "product",
    status: `${resolvedLabel} · ${LOCATOR_CITY_NAME}`,
    yandexUrl: `${YANDEX_MAPS_SEARCH_URL}${encodedQuery}/`,
  };
}
