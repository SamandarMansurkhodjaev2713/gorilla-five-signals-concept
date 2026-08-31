import type { SceneSetupContext } from "../create-scene";
import { MOTION_DURATION_SECONDS, MOTION_EASE } from "../tokens";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const MAGNETIC_TARGET_SELECTOR = [
  ".brand",
  ".desktop-navigation a[href]",
  ".locale-list a[href]",
  ".motion-toggle",
  ".mobile-navigation__panel nav a[href]",
  ".mobile-navigation__panel button:not([disabled])",
  ".mobile-navigation__panel .menu-locales a[href]",
].join(", ");
const MAGNETIC_SPEC = Object.freeze({
  maximumOffsetPx: 4,
  pressedScale: 0.98,
});

interface PointerPosition {
  readonly x: number;
  readonly y: number;
}

function isFinePrimaryPointer(event: PointerEvent): boolean {
  return event.isPrimary && event.pointerType === "mouse";
}

function magneticPosition(
  target: HTMLElement,
  event: PointerEvent,
): PointerPosition | null {
  const bounds = target.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) {
    return null;
  }
  const horizontalRatio = (event.clientX - bounds.left) / bounds.width - 0.5;
  const verticalRatio = (event.clientY - bounds.top) / bounds.height - 0.5;
  return {
    x: horizontalRatio * MAGNETIC_SPEC.maximumOffsetPx * 2,
    y: verticalRatio * MAGNETIC_SPEC.maximumOffsetPx * 2,
  };
}

class NavigationPointerController {
  private readonly abortController = new AbortController();
  private readonly animatedTargets = new Set<HTMLElement>();
  private activeTarget: HTMLElement | null = null;
  private cancelFrame: (() => void) | null = null;
  private pendingPosition: PointerPosition | null = null;

  constructor(private readonly context: SceneSetupContext) {
    const options = { signal: this.abortController.signal };
    const root = context.root;
    root.addEventListener("pointermove", this.handleMove, options);
    root.addEventListener("pointerdown", this.handleDown, options);
    root.addEventListener("pointerup", this.release, options);
    root.addEventListener("pointercancel", this.release, options);
    root.addEventListener("pointerout", this.handleOut, options);
    root.addEventListener("pointerleave", this.release, options);
    root.dataset.pointerFeedback = "magnetic";
  }

  destroy(): void {
    this.abortController.abort();
    this.cancelFrame?.();
    this.cancelFrame = null;
    this.activeTarget = null;
    for (const target of this.animatedTargets) {
      this.context.gsap.killTweensOf(target);
      this.clearTransform(target);
    }
    delete this.context.root.dataset.pointerFeedback;
  }

  private readonly handleMove = (event: Event): void => {
    if (!(event instanceof PointerEvent) || !isFinePrimaryPointer(event)) {
      return;
    }
    const target = this.resolveTarget(event.target);
    if (target !== this.activeTarget) {
      this.settleActive();
      this.activeTarget = target;
    }
    this.pendingPosition =
      target === null ? null : magneticPosition(target, event);
    if (this.pendingPosition !== null) {
      this.cancelFrame ??= this.context.requestFrame(this.applyPosition);
    }
  };

  private readonly handleDown = (event: Event): void => {
    if (!(event instanceof PointerEvent) || !isFinePrimaryPointer(event)) {
      return;
    }
    const target = this.resolveTarget(event.target);
    if (target === null) {
      return;
    }
    this.activeTarget = target;
    this.animatedTargets.add(target);
    this.context.gsap.to(target, {
      duration: MOTION_DURATION_SECONDS.instant,
      ease: MOTION_EASE.exit,
      overwrite: true,
      scale: MAGNETIC_SPEC.pressedScale,
    });
  };

  private readonly handleOut = (event: Event): void => {
    if (!(event instanceof PointerEvent) || this.activeTarget === null) {
      return;
    }
    const relatedTarget =
      event.relatedTarget instanceof Element ? event.relatedTarget : null;
    if (!relatedTarget || !this.activeTarget.contains(relatedTarget)) {
      this.release();
    }
  };

  private readonly release = (): void => {
    this.settleActive();
    this.activeTarget = null;
  };

  private readonly applyPosition = (): void => {
    this.cancelFrame = null;
    const target = this.activeTarget;
    const position = this.pendingPosition;
    this.pendingPosition = null;
    if (target === null || position === null) {
      return;
    }
    target.dataset.motionMagnetic = "tracking";
    this.animatedTargets.add(target);
    this.context.gsap.to(target, {
      duration: MOTION_DURATION_SECONDS.quick,
      ease: MOTION_EASE.snap,
      overwrite: true,
      x: position.x,
      y: position.y,
    });
  };

  private resolveTarget(eventTarget: EventTarget | null): HTMLElement | null {
    if (!(eventTarget instanceof Element)) {
      return null;
    }
    const target = eventTarget.closest<HTMLElement>(MAGNETIC_TARGET_SELECTOR);
    return target !== null &&
      this.context.root.contains(target) &&
      target.getAttribute("aria-disabled") !== "true"
      ? target
      : null;
  }

  private settleActive(): void {
    this.cancelFrame?.();
    this.cancelFrame = null;
    this.pendingPosition = null;
    const target = this.activeTarget;
    if (target === null) {
      return;
    }
    this.animatedTargets.add(target);
    this.context.gsap.to(target, {
      duration: MOTION_DURATION_SECONDS.quick,
      ease: MOTION_EASE.snap,
      onComplete: (): void => this.clearTransform(target),
      overwrite: true,
      scale: 1,
      x: 0,
      y: 0,
    });
  }

  private clearTransform(target: HTMLElement): void {
    this.context.gsap.set(target, { clearProps: "transform" });
    delete target.dataset.motionMagnetic;
    this.animatedTargets.delete(target);
  }
}

export function setupNavigationPointerResponse(
  context: SceneSetupContext,
): () => void {
  if (context.capability.kind !== "full") {
    return (): void => undefined;
  }
  context.media.add(FINE_POINTER_QUERY, (): (() => void) => {
    const controller = new NavigationPointerController(context);
    return (): void => controller.destroy();
  });
  return (): void => {
    delete context.root.dataset.pointerFeedback;
  };
}
