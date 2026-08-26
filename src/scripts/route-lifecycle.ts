import { synchronizeLocaleProductLinks } from "../features/product-explorer/product-explorer-url";
import { createRouteTransitionController } from "../motion/route-transition";

const ROUTE_FOCUS_REQUEST_KEY = "gorilla:route-focus-requested:v1";
const ASTRO_HISTORY_SCROLL_FIELD = "scrollY";
const HISTORY_SCROLL_FIELD = "gorillaScrollY";
const HTTP_PROTOCOLS = new Set(["http:", "https:"]);
const SCROLL_RESTORE_FRAME_COUNT = 12;
const SCROLL_RESTORE_TOLERANCE_PX = 12;

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

type ScrollCaptureMode = "router-state" | "viewport";

function readScrollField(
  state: Record<string, unknown>,
  field: string,
): number | null {
  const value = Reflect.get(state, field);
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function storeRouteScroll(mode: ScrollCaptureMode = "viewport"): void {
  try {
    const currentState: unknown = history.state;
    const routerScrollY =
      mode === "router-state" && isRecord(currentState)
        ? readScrollField(currentState, ASTRO_HISTORY_SCROLL_FIELD)
        : null;
    const capturedScrollY = routerScrollY ?? Math.round(scrollY);
    const nextState = isRecord(currentState)
      ? { ...currentState, [HISTORY_SCROLL_FIELD]: capturedScrollY }
      : { [HISTORY_SCROLL_FIELD]: capturedScrollY };
    history.replaceState(nextState, "", location.href);
  } catch (error: unknown) {
    reportRouteLifecycleError(error);
  }
}

function readRouteScroll(): number | null {
  const currentState: unknown = history.state;
  if (!isRecord(currentState)) {
    return null;
  }
  return readScrollField(currentState, HISTORY_SCROLL_FIELD);
}

function restoreStoredScroll(): void {
  const expectedScrollY = readRouteScroll();
  if (expectedScrollY === null) {
    return;
  }

  let framesRemaining = SCROLL_RESTORE_FRAME_COUNT;
  const restore = (): void => {
    const delta = Math.abs(scrollY - expectedScrollY);
    if (delta > SCROLL_RESTORE_TOLERANCE_PX) {
      scrollTo(0, expectedScrollY);
    }

    framesRemaining -= 1;
    if (framesRemaining > 0) {
      requestAnimationFrame(restore);
    }
  };
  requestAnimationFrame(restore);
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

const routeTransitionController = createRouteTransitionController(
  document,
  window,
);

window.addEventListener("pagehide", (event): void => {
  if (!event.persisted) {
    routeTransitionController.destroy();
  }
});

document.addEventListener(
  "click",
  (event): void => {
    if (!(event instanceof MouseEvent)) {
      return;
    }
    if (isMenuSummaryClick(event)) {
      // The menu's scroll lock can move the visual viewport to zero. Capture
      // the route position before the summary's default toggle runs.
      storeRouteScroll("router-state");
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
