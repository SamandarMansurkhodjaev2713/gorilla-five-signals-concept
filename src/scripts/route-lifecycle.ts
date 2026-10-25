import { synchronizeLocaleProductLinks } from "../features/product-explorer/product-explorer-url";
import {
  ROUTE_HISTORY_SCROLL_FIELD,
  RELOAD_SCROLL_STORAGE_KEY,
  parseReloadScrollHandoff,
  readInitialReloadScroll,
} from "../features/site/reload-scroll";
import { createRouteTransitionController } from "../motion/route-transition";
import { MOTION_RUNTIME_READY_EVENT } from "../motion/runtime/runtime-contract";
import { createScrollRestoration } from "../motion/scroll-restoration";

const ROUTE_FOCUS_REQUEST_KEY = "gorilla:route-focus-requested:v1";
const HTTP_PROTOCOLS = new Set(["http:", "https:"]);
const SCROLL_RESTORE_FRAME_COUNT = 12;
const SCROLL_RESTORE_TOLERANCE_PX = 12;
const SCROLL_RESTORE_STABLE_FRAMES = 2;

function reportRouteLifecycleError(error: unknown): void {
  window.dispatchEvent(
    new CustomEvent("gorilla:route-lifecycle-error", {
      detail: {
        code: "storage-unavailable",
        message:
          error instanceof Error
            ? error.message
            : "Route lifecycle storage is unavailable.",
      },
    }),
  );
}

function requestHeadingFocus(destination: URL): void {
  try {
    sessionStorage.setItem(ROUTE_FOCUS_REQUEST_KEY, destination.href);
  } catch (error: unknown) {
    reportRouteLifecycleError(error);
  }
}

function consumeHeadingFocusRequest(): boolean {
  try {
    const requestedHref = sessionStorage.getItem(ROUTE_FOCUS_REQUEST_KEY);
    if (requestedHref === null) {
      return false;
    }
    if (!URL.canParse(requestedHref)) {
      sessionStorage.removeItem(ROUTE_FOCUS_REQUEST_KEY);
      return false;
    }
    const requested = new URL(requestedHref);
    const isRequested = requested.pathname === location.pathname;
    if (!isRequested) {
      return false;
    }
    sessionStorage.removeItem(ROUTE_FOCUS_REQUEST_KEY);
    return true;
  } catch (error: unknown) {
    reportRouteLifecycleError(error);
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readScrollField(
  state: Record<string, unknown>,
  field: string,
): number | null {
  const value = Reflect.get(state, field);
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function updateRouteHistory(fields: Readonly<Record<string, number>>): void {
  const currentState: unknown = history.state;
  const nextState = isRecord(currentState)
    ? { ...currentState, ...fields }
    : fields;
  history.replaceState(nextState, "", location.href);
}

function storeRouteScroll(): void {
  try {
    updateRouteHistory({ [ROUTE_HISTORY_SCROLL_FIELD]: Math.round(scrollY) });
  } catch (error: unknown) {
    reportRouteLifecycleError(error);
  }
}

function readRouteScroll(): number | null {
  const currentState: unknown = history.state;
  if (!isRecord(currentState)) {
    return null;
  }
  return readScrollField(currentState, ROUTE_HISTORY_SCROLL_FIELD);
}

function storeReloadScroll(): void {
  try {
    const menuOpen =
      document.querySelector("[data-motion-menu][open]") !== null;
    const preservedPosition = menuOpen ? readRouteScroll() : null;
    const position = preservedPosition ?? Math.max(0, Math.round(scrollY));
    sessionStorage.setItem(
      RELOAD_SCROLL_STORAGE_KEY,
      JSON.stringify({ path: location.pathname, position }),
    );
  } catch (error: unknown) {
    reportRouteLifecycleError(error);
  }
}

function consumeReloadHandoff(): number | null {
  try {
    const serialized = sessionStorage.getItem(RELOAD_SCROLL_STORAGE_KEY);
    sessionStorage.removeItem(RELOAD_SCROLL_STORAGE_KEY);
    const handoff = parseReloadScrollHandoff({
      serialized,
      path: location.pathname,
    });
    if (handoff.kind === "captured") return handoff.position;
    if (handoff.kind === "discarded" && handoff.reason !== "different-route")
      reportRouteLifecycleError(
        new Error(`Reload scroll handoff rejected: ${handoff.reason}`),
      );
    return null;
  } catch (error: unknown) {
    reportRouteLifecycleError(error);
    return null;
  }
}

function restoreStoredScroll(): void {
  const expectedScrollY = pendingReloadScroll ?? readRouteScroll();
  pendingReloadScroll = null;
  if (expectedScrollY === null) {
    return;
  }

  scrollRestoration.restore(expectedScrollY);
}

function isPlainPrimaryClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

function eventElement(event: MouseEvent): Element | null {
  return event.target instanceof Element ? event.target : null;
}

function isMenuSummaryClick(event: MouseEvent): boolean {
  const summary = eventElement(event)?.closest("summary");
  return summary?.parentElement?.matches("[data-motion-menu]") ?? false;
}

function isOpenMenuNavigation(event: MouseEvent): boolean {
  const openMenu = eventElement(event)
    ?.closest("a[href]")
    ?.closest("[data-motion-menu][open]");
  return openMenu instanceof Element;
}

function routeFocusDestination(event: MouseEvent): URL | null {
  if (event.defaultPrevented || !isPlainPrimaryClick(event)) {
    return null;
  }

  const target = event.target;
  const anchor =
    target instanceof Element
      ? target.closest<HTMLAnchorElement>("a[href]")
      : null;
  if (
    anchor === null ||
    anchor.hasAttribute("download") ||
    (anchor.target !== "" && anchor.target !== "_self")
  ) {
    return null;
  }

  const destination = new URL(anchor.href);
  const current = new URL(window.location.href);
  const isSameDocument =
    destination.pathname === current.pathname &&
    destination.search === current.search;

  const shouldFocus =
    HTTP_PROTOCOLS.has(destination.protocol) &&
    destination.origin === current.origin &&
    !isSameDocument;
  return shouldFocus ? destination : null;
}

function focusRouteHeading(): void {
  const responsibleDialog = document.querySelector<HTMLDialogElement>(
    "[data-responsible-entry]",
  );
  if (responsibleDialog?.open) {
    return;
  }

  const heading = document.querySelector<HTMLHeadingElement>("main h1");
  if (heading === null) {
    return;
  }

  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}

function restoreRouteLifecycle(): void {
  synchronizeLocaleProductLinks(document, window);
  // Astro owns `history.scrollRestoration = "manual"`. The custom field is
  // deliberately separate because Chromium can overwrite Astro's scrollY
  // with the outgoing page position while a traverse transition is loading.
  restoreStoredScroll();
  if (!consumeHeadingFocusRequest()) {
    return;
  }

  requestAnimationFrame(focusRouteHeading);
}

const initialNavigation = performance.getEntriesByType("navigation")[0];
const initialHistoryState: unknown = history.state;
let pendingReloadScroll = readInitialReloadScroll({
  navigationType:
    initialNavigation === undefined
      ? undefined
      : Reflect.get(initialNavigation, "type"),
  historyState: initialHistoryState,
  handoffPosition: consumeReloadHandoff(),
});
const initialRuntimeState = document.documentElement.dataset.motionRuntimeState;
let pendingReloadLayoutScroll =
  initialRuntimeState === "ready" || initialRuntimeState === "fallback"
    ? null
    : pendingReloadScroll;

const routeTransitionController = createRouteTransitionController(
  document,
  window,
);
const scrollRestoration = createScrollRestoration({
  maximumFrames: SCROLL_RESTORE_FRAME_COUNT,
  stableFrames: SCROLL_RESTORE_STABLE_FRAMES,
  tolerancePx: SCROLL_RESTORE_TOLERANCE_PX,
  port: {
    currentY: () => scrollY,
    writeY: (position) => scrollTo(0, position),
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (handle) => cancelAnimationFrame(handle),
  },
});
const scrollIntentController = new AbortController();
const cancelScrollRestoration = (): void => {
  pendingReloadScroll = null;
  pendingReloadLayoutScroll = null;
  scrollRestoration.cancel();
};
for (const eventType of [
  "wheel",
  "touchstart",
  "pointerdown",
  "keydown",
  "hashchange",
  "popstate",
]) {
  window.addEventListener(eventType, cancelScrollRestoration, {
    capture: true,
    passive: true,
    signal: scrollIntentController.signal,
  });
}
document.addEventListener("astro:before-preparation", cancelScrollRestoration, {
  signal: scrollIntentController.signal,
});
window.addEventListener(
  MOTION_RUNTIME_READY_EVENT,
  (event): void => {
    if (!(event instanceof CustomEvent)) return;
    const state: unknown = event.detail;
    if (state !== "ready" && state !== "fallback") return;
    const expectedScrollY = pendingReloadLayoutScroll;
    pendingReloadLayoutScroll = null;
    if (expectedScrollY !== null) scrollRestoration.restore(expectedScrollY);
  },
  { signal: scrollIntentController.signal },
);

window.addEventListener("pagehide", (event): void => {
  cancelScrollRestoration();
  if (!event.persisted) {
    storeReloadScroll();
    scrollIntentController.abort();
    routeTransitionController.destroy();
  }
});

document.addEventListener(
  "click",
  (event): void => {
    if (!(event instanceof MouseEvent)) {
      return;
    }
    if (
      isMenuSummaryClick(event) &&
      document.querySelector("[data-motion-menu][open]") === null
    ) {
      // The menu's scroll lock can move the visual viewport to zero. Capture
      // the route position before the summary's default toggle runs.
      storeRouteScroll();
    }
    const destination = routeFocusDestination(event);
    if (destination !== null) {
      const preservedMenuScroll =
        isOpenMenuNavigation(event) && readRouteScroll() !== null;
      if (!preservedMenuScroll) {
        storeRouteScroll();
      }
      requestHeadingFocus(destination);
    }
  },
  { capture: true },
);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", restoreRouteLifecycle, {
    once: true,
  });
} else {
  restoreRouteLifecycle();
}

document.addEventListener("astro:page-load", restoreRouteLifecycle);
