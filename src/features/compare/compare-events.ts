import type { CompareElements } from "./compare-contract";

export interface CompareEventHandlers {
  readonly clearSelection: EventListener;
  readonly copySelection: EventListener;
  readonly locationChange: EventListener;
  readonly selectionChange: EventListener;
  readonly viewportChange: EventListener;
}

function bindControlEvents(options: {
  readonly elements: CompareElements;
  readonly handlers: CompareEventHandlers;
  readonly listenerOptions: AddEventListenerOptions;
}): void {
  options.elements.clearButton.addEventListener(
    "click",
    options.handlers.clearSelection,
    options.listenerOptions,
  );
  options.elements.copyButton.addEventListener(
    "click",
    options.handlers.copySelection,
    options.listenerOptions,
  );
}

export function bindCompareEvents(options: {
  readonly desktopQuery: MediaQueryList;
  readonly elements: CompareElements;
  readonly handlers: CompareEventHandlers;
  readonly signal: AbortSignal;
  readonly windowValue: Window;
}): void {
  const listenerOptions = { signal: options.signal };
  options.elements.root.addEventListener(
    "change",
    options.handlers.selectionChange,
    listenerOptions,
  );
  bindControlEvents({
    elements: options.elements,
    handlers: options.handlers,
    listenerOptions,
  });
  options.desktopQuery.addEventListener(
    "change",
    options.handlers.viewportChange,
    listenerOptions,
  );
  options.windowValue.addEventListener(
    "popstate",
    options.handlers.locationChange,
    listenerOptions,
  );
}
