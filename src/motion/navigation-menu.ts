const CLOSE_SELECTOR = "[data-motion-menu-close]";
const MENU_SELECTOR = "[data-motion-menu]";
const PANEL_SELECTOR = "[data-motion-menu-panel]";
const ROOT_SELECTOR = '[data-motion-scene="navigation"]';
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

type InertSnapshot = Readonly<{
  ariaHidden: string | null;
  element: HTMLElement;
  inert: boolean;
}>;

function backgroundElements(
  root: HTMLElement,
  menu: HTMLDetailsElement,
): readonly HTMLElement[] {
  const bodySiblings = Array.from(root.ownerDocument.body.children).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && element !== root,
  );
  const headerSiblings = Array.from(root.children).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && element !== menu,
  );
  return [...bodySiblings, ...headerSiblings];
}

function makeBackgroundInert(
  elements: readonly HTMLElement[],
): readonly InertSnapshot[] {
  return elements.map((element) => {
    const snapshot = {
      ariaHidden: element.getAttribute("aria-hidden"),
      element,
      inert: element.inert,
    };
    element.inert = true;
    element.setAttribute("aria-hidden", "true");
    return snapshot;
  });
}

function restoreBackground(snapshots: readonly InertSnapshot[]): void {
  for (const snapshot of snapshots) {
    snapshot.element.inert = snapshot.inert;
    if (snapshot.ariaHidden === null) {
      snapshot.element.removeAttribute("aria-hidden");
    } else {
      snapshot.element.setAttribute("aria-hidden", snapshot.ariaHidden);
    }
  }
}

function focusableElements(panel: HTMLElement): readonly HTMLElement[] {
  return Array.from(
    panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => !element.inert && element.getClientRects().length > 0);
}

function trapTab(event: KeyboardEvent, panel: HTMLElement): void {
  const focusable = focusableElements(panel);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!first || !last) {
    event.preventDefault();
    panel.focus();
    return;
  }

  const active = panel.ownerDocument.activeElement;
  if (event.shiftKey && (active === first || !panel.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

export interface AccessibleMenuController {
  destroy(): void;
}

export function createAccessibleMenu(
  documentValue: Document,
): AccessibleMenuController {
  const root = documentValue.querySelector<HTMLElement>(ROOT_SELECTOR);
  const menu = root?.querySelector<HTMLDetailsElement>(MENU_SELECTOR);
  if (!root || !menu) {
    return { destroy: (): void => undefined };
  }

  const panel = menu.querySelector<HTMLElement>(PANEL_SELECTOR);
  const close = menu.querySelector<HTMLButtonElement>(CLOSE_SELECTOR);
  const summary = menu.querySelector<HTMLElement>("summary");
  if (!panel || !close || !summary) {
    return { destroy: (): void => undefined };
  }

  const abortController = new AbortController();
  let background: readonly InertSnapshot[] = [];
  const closeMenu = (): void => {
    menu.open = false;
  };
  const synchronize = (): void => {
    restoreBackground(background);
    background = [];
    panel.removeAttribute("aria-modal");
    panel.removeAttribute("role");

    if (!menu.open) {
      summary.focus();
      return;
    }

    background = makeBackgroundInert(backgroundElements(root, menu));
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("role", "dialog");
    close.focus();
  };
  const handleKeydown = (event: Event): void => {
    if (!(event instanceof KeyboardEvent) || !menu.open) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
    } else if (event.key === "Tab") {
      trapTab(event, panel);
    }
  };

  menu.addEventListener("toggle", synchronize, {
    signal: abortController.signal,
  });
  close.addEventListener("click", closeMenu, {
    signal: abortController.signal,
  });
  documentValue.addEventListener("keydown", handleKeydown, {
    signal: abortController.signal,
  });
  root.dataset.menuReady = "true";

  return {
    destroy: (): void => {
      abortController.abort();
      restoreBackground(background);
      panel.removeAttribute("aria-modal");
      panel.removeAttribute("role");
      delete root.dataset.menuReady;
    },
  };
}
