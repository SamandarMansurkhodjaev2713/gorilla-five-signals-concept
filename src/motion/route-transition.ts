import { hasResponsibleEntryConfirmation } from "./responsible-entry";

const ROUTE_SIGNAL_SELECTOR = "[data-route-signal]";
const ROUTE_CODE_SELECTOR = "[data-route-signal-code]";
const RESPONSIBLE_ENTRY_SELECTOR = "[data-responsible-entry]";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const DEFAULT_ROUTE_CODE = "SIGNAL";
const HOME_ROUTE_CODE = "HOME";
const MAXIMUM_ROUTE_CODE_LENGTH = 24;
const ARRIVAL_RESET_DELAY_MS = Object.freeze({
  full: 560,
  lite: 280,
  reduced: 0,
});

type RouteMotionTier = keyof typeof ARRIVAL_RESET_DELAY_MS;
type RoutePhase = "arriving" | "departing" | "idle";

export interface RouteTransitionController {
  destroy(): void;
}

function routeSignalRoot(documentValue: Document): HTMLElement | null {
  return documentValue.querySelector<HTMLElement>(ROUTE_SIGNAL_SELECTOR);
}

function currentMotionTier(
  documentValue: Document,
  windowValue: Window,
): RouteMotionTier {
  const tier = documentValue.documentElement.dataset.motionTier;
  if (tier === "full" || tier === "lite" || tier === "reduced") {
    return tier;
  }
  return windowValue.matchMedia(REDUCED_MOTION_QUERY).matches
    ? "reduced"
    : "lite";
}

function routeCode(destination: URL): string {
  const segments = destination.pathname.split("/").filter(Boolean);
  const candidate = segments.at(-1) ?? HOME_ROUTE_CODE;
  const normalized = candidate
    .replaceAll("-", " ")
    .replace(/[^a-z0-9 ]/giu, "")
    .trim()
    .slice(0, MAXIMUM_ROUTE_CODE_LENGTH);
  return normalized === "" ? DEFAULT_ROUTE_CODE : normalized.toUpperCase();
}

function setRoutePhase(
  documentValue: Document,
  phase: RoutePhase,
  tier: RouteMotionTier,
): void {
  const root = routeSignalRoot(documentValue);
  if (root === null) {
    return;
  }
  root.dataset.routeMotion = tier;
  root.dataset.routePhase = tier === "reduced" ? "idle" : phase;
  if (phase === "arriving" && tier !== "reduced") {
    documentValue.documentElement.dataset.routePhase = phase;
  } else {
    delete documentValue.documentElement.dataset.routePhase;
  }
}

function updateRouteCode(documentValue: Document, destination: URL): void {
  const code =
    routeSignalRoot(documentValue)?.querySelector<HTMLElement>(
      ROUTE_CODE_SELECTOR,
    );
  if (code !== null && code !== undefined) {
    code.textContent = routeCode(destination);
  }
}

function prepareResponsibleEntry(
  nextDocument: Document,
  windowValue: Window,
): void {
  if (!hasResponsibleEntryConfirmation(windowValue)) {
    return;
  }
  nextDocument
    .querySelector<HTMLDialogElement>(RESPONSIBLE_ENTRY_SELECTOR)
    ?.removeAttribute("open");
}

class RouteTransitionCoordinator implements RouteTransitionController {
  private readonly abortController = new AbortController();
  private resetTimer: number | null = null;
  private generation = 0;

  constructor(
    private readonly documentValue: Document,
    private readonly windowValue: Window,
  ) {
    const listenerOptions = { signal: this.abortController.signal };
    documentValue.addEventListener(
      "astro:before-preparation",
      (event): void => this.beforePreparation(event),
      listenerOptions,
    );
    documentValue.addEventListener(
      "astro:before-swap",
      (event): void =>
        prepareResponsibleEntry(event.newDocument, this.windowValue),
      listenerOptions,
    );
    documentValue.addEventListener(
      "astro:after-swap",
      (): void => this.afterSwap(),
      listenerOptions,
    );
  }

  destroy(): void {
    this.generation += 1;
    this.abortController.abort();
    this.clearResetTimer();
    setRoutePhase(this.documentValue, "idle", "reduced");
  }

  private beforePreparation(
    event: DocumentEventMap["astro:before-preparation"],
  ): void {
    this.clearResetTimer();
    const activeGeneration = ++this.generation;
    const tier = currentMotionTier(this.documentValue, this.windowValue);
    updateRouteCode(this.documentValue, event.to);
    setRoutePhase(this.documentValue, "departing", tier);
    event.signal.addEventListener(
      "abort",
      (): void => this.reset(activeGeneration),
      { once: true, signal: this.abortController.signal },
    );
  }

  private afterSwap(): void {
    const activeGeneration = this.generation;
    const tier = currentMotionTier(this.documentValue, this.windowValue);
    setRoutePhase(this.documentValue, "arriving", tier);
    this.clearResetTimer();
    this.resetTimer = this.windowValue.setTimeout(
      (): void => this.reset(activeGeneration),
      ARRIVAL_RESET_DELAY_MS[tier],
    );
  }

  private reset(activeGeneration: number): void {
    if (activeGeneration !== this.generation) {
      return;
    }
    this.clearResetTimer();
    setRoutePhase(this.documentValue, "idle", "reduced");
  }

  private clearResetTimer(): void {
    if (this.resetTimer === null) {
      return;
    }
    this.windowValue.clearTimeout(this.resetTimer);
    this.resetTimer = null;
  }
}

export function createRouteTransitionController(
  documentValue: Document = document,
  windowValue: Window = window,
): RouteTransitionController {
  return new RouteTransitionCoordinator(documentValue, windowValue);
}
