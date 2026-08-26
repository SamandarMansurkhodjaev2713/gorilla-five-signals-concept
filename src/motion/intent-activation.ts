const DOCUMENT_INTENT_EVENTS = [
  "keydown",
  "pointerdown",
  "pointermove",
  "touchstart",
  "wheel",
] as const;

export interface IntentActivationController {
  destroy(): void;
}

export function createIntentActivation(
  documentValue: Document,
  onActivated: () => void,
): IntentActivationController {
  const controller = new AbortController();
  let activated = false;
  const activate = (): void => {
    if (activated) {
      return;
    }
    activated = true;
    controller.abort();
    onActivated();
  };

  for (const eventName of DOCUMENT_INTENT_EVENTS) {
    documentValue.addEventListener(eventName, activate, {
      passive: true,
      signal: controller.signal,
    });
  }
  documentValue.defaultView?.addEventListener("scroll", activate, {
    passive: true,
    signal: controller.signal,
  });

  return {
    destroy(): void {
      controller.abort();
    },
  };
}
