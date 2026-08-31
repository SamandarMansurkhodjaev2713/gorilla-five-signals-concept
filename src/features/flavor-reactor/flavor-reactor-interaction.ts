const INTERACTIVE_SELECTOR = "a, button, input, select, textarea";
const STAGE_SELECTOR = "[data-reactor-gesture]";
const SELECTOR_SELECTOR = "[data-product-selector]";
const PREVIOUS_SELECTOR = "[data-product-previous]";
const NEXT_SELECTOR = "[data-product-next]";
const DRAG_THRESHOLD_PX = 52;
const MAX_DRAG_DISTANCE_PX = 72;
const HORIZONTAL_INTENT_RATIO = 1.2;

interface InteractionContext {
  readonly root: HTMLElement;
  listen(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions,
  ): void;
  requestFrame(callback: FrameRequestCallback): () => void;
}

interface PointerSession {
  readonly id: number;
  readonly startX: number;
  readonly startY: number;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null
  );
}

function clampDrag(distance: number): number {
  return Math.max(
    -MAX_DRAG_DISTANCE_PX,
    Math.min(MAX_DRAG_DISTANCE_PX, distance),
  );
}

function activateControl(
  root: HTMLElement,
  direction: "next" | "previous",
): void {
  const selector = direction === "next" ? NEXT_SELECTOR : PREVIOUS_SELECTOR;
  root.querySelector<HTMLButtonElement>(selector)?.click();
}

function hasHorizontalIntent(deltaX: number, deltaY: number): boolean {
  return Math.abs(deltaX) > Math.abs(deltaY) * HORIZONTAL_INTENT_RATIO;
}

function isPrimaryActivation(event: PointerEvent): boolean {
  return event.pointerType === "mouse" ? event.button === 0 : event.isPrimary;
}

export function mountFlavorReactorInteraction(
  context: InteractionContext,
): () => void {
  const stage = context.root.querySelector<HTMLElement>(STAGE_SELECTOR);
  if (stage === null) {
    return (): void => undefined;
  }

  let pointer: PointerSession | null = null;
  let cancelFrame: (() => void) | null = null;

  const renderDrag = (distance: number): void => {
    cancelFrame?.();
    cancelFrame = context.requestFrame((): void => {
      cancelFrame = null;
      stage.style.setProperty(
        "--reactor-drag-x",
        `${String(clampDrag(distance))}px`,
      );
    });
  };

  const resetDrag = (): void => {
    cancelFrame?.();
    cancelFrame = null;
    stage.style.removeProperty("--reactor-drag-x");
  };

  const handlePointerDown = (event: Event): void => {
    if (
      !(event instanceof PointerEvent) ||
      !isPrimaryActivation(event) ||
      isInteractiveTarget(event.target)
    ) {
      return;
    }
    pointer = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    stage.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: Event): void => {
    if (!(event instanceof PointerEvent) || pointer?.id !== event.pointerId) {
      return;
    }
    const deltaX = event.clientX - pointer.startX;
    const deltaY = event.clientY - pointer.startY;
    if (hasHorizontalIntent(deltaX, deltaY)) {
      event.preventDefault();
      renderDrag(deltaX);
    }
  };

  const finishPointer = (event: PointerEvent): void => {
    if (pointer?.id !== event.pointerId) {
      return;
    }
    const deltaX = event.clientX - pointer.startX;
    const deltaY = event.clientY - pointer.startY;
    pointer = null;
    resetDrag();
    if (
      Math.abs(deltaX) >= DRAG_THRESHOLD_PX &&
      hasHorizontalIntent(deltaX, deltaY)
    ) {
      activateControl(context.root, deltaX < 0 ? "next" : "previous");
    }
  };

  const cancelPointer = (event: PointerEvent): void => {
    if (pointer?.id !== event.pointerId) {
      return;
    }
    pointer = null;
    resetDrag();
  };

  const handlePointerEnd = (event: Event): void => {
    if (event instanceof PointerEvent) {
      finishPointer(event);
    }
  };

  const handlePointerCancel = (event: Event): void => {
    if (event instanceof PointerEvent) {
      cancelPointer(event);
    }
  };

  const handleKeyboard = (event: Event): void => {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    const target = event.target;
    const isReactorControl =
      target instanceof Element &&
      (target.matches(STAGE_SELECTOR) ||
        target.closest(SELECTOR_SELECTOR) !== null);
    if (!isReactorControl || !["ArrowLeft", "ArrowRight"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    activateControl(
      context.root,
      event.key === "ArrowRight" ? "next" : "previous",
    );
  };

  context.listen(stage, "pointerdown", handlePointerDown);
  context.listen(stage, "pointermove", handlePointerMove, { passive: false });
  context.listen(stage, "pointerup", handlePointerEnd);
  context.listen(stage, "pointercancel", handlePointerCancel);
  context.listen(stage, "lostpointercapture", handlePointerCancel);
  context.listen(context.root, "keydown", handleKeyboard);

  return (): void => {
    pointer = null;
    resetDrag();
  };
}
