import {
  LOCATOR_ROOT_SELECTOR,
  type LocatorController,
  type LocatorElements,
} from "./locator-contract";
import { collectLocatorElements } from "./locator-elements";
import { createLocatorUrl, resolveLocatorSlug } from "./locator-state";
import { renderLocator } from "./locator-view";
import { publishMotionDiagnostic } from "../../motion/diagnostics";

function optionValues(select: HTMLSelectElement): readonly string[] {
  return [...select.options].map(({ value }) => value);
}

function updateLocation(windowValue: Window, slug: string): void {
  windowValue.history.pushState(
    {},
    "",
    createLocatorUrl(windowValue.location.href, slug),
  );
}

function publishSelection(elements: LocatorElements, slug: string): void {
  elements.root.dispatchEvent(
    new CustomEvent("gorilla:locator-change", {
      detail: { slug },
    }),
  );
}

function createSession(
  elements: LocatorElements,
  windowValue: Window,
): LocatorController {
  const abortController = new AbortController();
  const renderUrl = (): void => {
    renderLocator(elements, {
      slug: resolveLocatorSlug(
        optionValues(elements.productSelect),
        windowValue.location.href,
      ),
    });
  };
  elements.productSelect.addEventListener(
    "change",
    (): void => {
      const slug = elements.productSelect.value;
      updateLocation(windowValue, slug);
      renderLocator(elements, { slug });
      publishSelection(elements, slug);
    },
    { signal: abortController.signal },
  );
  windowValue.addEventListener("popstate", renderUrl, {
    signal: abortController.signal,
  });
  renderUrl();
  return { destroy: (): void => abortController.abort() };
}

export function createLocatorHandoff(
  documentRoot: Document,
): LocatorController {
  const root = documentRoot.querySelector<HTMLElement>(LOCATOR_ROOT_SELECTOR);
  if (root === null) {
    return { destroy: (): void => undefined };
  }
  const elements = collectLocatorElements(root);
  const windowValue = documentRoot.defaultView;
  if (elements === null || windowValue === null) {
    if (windowValue !== null) {
      publishMotionDiagnostic(windowValue, {
        code: "controller-contract-invalid",
        message: "The locator DOM contract is incomplete or inconsistent.",
      });
    }
    return { destroy: (): void => undefined };
  }
  return createSession(elements, windowValue);
}
