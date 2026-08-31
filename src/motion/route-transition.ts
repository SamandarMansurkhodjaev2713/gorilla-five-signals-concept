import { MOTION_PREFERENCE_EVENT } from "./preference-controller";
import { hasResponsibleEntryConfirmation } from "./responsible-entry";
import {
  currentRouteMotionTier,
  routeSignalRoot,
  setRoutePhase,
  updateRouteCode,
} from "./route-transition-state";

const RESPONSIBLE_ENTRY_SELECTOR = "[data-responsible-entry]";
const ARRIVAL_RESET_DELAY_MS = Object.freeze({
  full: 560,
  lite: 280,
  reduced: 0,
});

export interface RouteTransitionController {
  destroy(): void;
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
    windowValue.addEventListener(
      MOTION_PREFERENCE_EVENT,
      (): void => this.synchronizeTier(),
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
    const tier = currentRouteMotionTier(this.documentValue, this.windowValue);
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
    const tier = currentRouteMotionTier(this.documentValue, this.windowValue);
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
    setRoutePhase(
      this.documentValue,
      "idle",
      currentRouteMotionTier(this.documentValue, this.windowValue),
    );
  }

  private synchronizeTier(): void {
    const tier = currentRouteMotionTier(this.documentValue, this.windowValue);
    const phase = routeSignalRoot(this.documentValue)?.dataset.routePhase;
    if (phase !== "arriving" && phase !== "departing") {
      setRoutePhase(this.documentValue, "idle", tier);
      return;
    }
    setRoutePhase(this.documentValue, phase, tier);
    if (phase !== "arriving") {
      return;
    }
    this.clearResetTimer();
    const activeGeneration = this.generation;
    this.resetTimer = this.windowValue.setTimeout(
      (): void => this.reset(activeGeneration),
      ARRIVAL_RESET_DELAY_MS[tier],
    );
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
