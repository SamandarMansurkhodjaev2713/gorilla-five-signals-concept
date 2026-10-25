const ROUTE_SIGNAL_SELECTOR = "[data-route-signal]";
const ROUTE_CODE_SELECTOR = "[data-route-signal-code]";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const DEFAULT_ROUTE_CODE = "SIGNAL";
const HOME_ROUTE_CODE = "HOME";
const MAXIMUM_ROUTE_CODE_LENGTH = 24;

export type RouteMotionTier = "full" | "lite" | "reduced";
export type RoutePhase = "arriving" | "departing" | "idle";

function decodeRouteSegment(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch (error: unknown) {
    if (error instanceof URIError) {
      return null;
    }
    throw error;
  }
}

function isRouteMotionTier(
  value: string | undefined,
): value is RouteMotionTier {
  return value === "full" || value === "lite" || value === "reduced";
}

export function routeSignalRoot(documentValue: Document): HTMLElement | null {
  return documentValue.querySelector<HTMLElement>(ROUTE_SIGNAL_SELECTOR);
}

export function currentRouteMotionTier(
  documentValue: Document,
  windowValue: Window,
): RouteMotionTier {
  const preference = documentValue.documentElement.dataset.motionPreference;
  if (isRouteMotionTier(preference)) {
    return preference;
  }
  const tier = documentValue.documentElement.dataset.motionTier;
  if (isRouteMotionTier(tier)) {
    return tier;
  }
  return windowValue.matchMedia(REDUCED_MOTION_QUERY).matches
    ? "reduced"
    : "lite";
}

export function createRouteCode(destination: URL): string {
  const segments = destination.pathname.split("/").filter(Boolean);
  const encodedCandidate =
    segments.length <= 1
      ? HOME_ROUTE_CODE
      : (segments.at(-1) ?? HOME_ROUTE_CODE);
  const candidate = decodeRouteSegment(encodedCandidate);
  if (candidate === null) {
    return DEFAULT_ROUTE_CODE;
  }
  const normalized = candidate
    .replaceAll("-", " ")
    .replace(/[^a-z0-9 ]/giu, "")
    .trim()
    .slice(0, MAXIMUM_ROUTE_CODE_LENGTH);
  return normalized === "" ? DEFAULT_ROUTE_CODE : normalized.toUpperCase();
}

export function setRoutePhase(
  documentValue: Document,
  phase: RoutePhase,
  tier: RouteMotionTier,
): void {
  const root = routeSignalRoot(documentValue);
  if (root !== null) {
    root.dataset.routeMotion = tier;
    root.dataset.routePhase = tier === "reduced" ? "idle" : phase;
  }
  if (phase === "arriving" && tier !== "reduced") {
    documentValue.documentElement.dataset.routePhase = phase;
  } else {
    delete documentValue.documentElement.dataset.routePhase;
  }
}

export function updateRouteCode(
  documentValue: Document,
  destination: URL,
): void {
  const code =
    routeSignalRoot(documentValue)?.querySelector<HTMLElement>(
      ROUTE_CODE_SELECTOR,
    );
  if (code !== null && code !== undefined) {
    code.textContent = createRouteCode(destination);
  }
}
