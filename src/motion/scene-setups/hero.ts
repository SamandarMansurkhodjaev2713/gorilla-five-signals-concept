import type { SceneSetup } from "../create-scene";
import {
  MOTION_DURATION_SECONDS,
  MOTION_EASE,
  MOTION_ROTATION_DEGREES,
} from "../tokens";
import { markSceneReady } from "./shared";

const CAN_SELECTOR = "[data-hero-can]";
const TICKER_SELECTOR = "[data-hero-ticker]";
const SIGNAL_FIELD_SELECTOR = "[data-motion-hero-signals] > span";
const WORD_SELECTOR = "[data-motion-hero-word]";
const BAND_SELECTOR = "[data-motion-hero-band]";
const SUPPORTING_COPY_SELECTOR = ".hero-kicker, .hero-intro, .hero-actions";
const POINTER_DEPTH_PX = 9;
const FLOAT_DISTANCE_PX = 18;
const CAN_ENTRY_ROTATION_DEGREES = 2;
const TICKER_SETTLE_X_PERCENT = -12;
const SIGNAL_STAGGER_SECONDS = 0.055;
const SUPPORTING_COPY_STAGGER_SECONDS = 0.07;
const WORD_ENTRY_Y_PERCENT = 28;
const BAND_ENTRY_ROTATION_DEGREES = -7;
const COPY_ENTRY_Y_PX = 22;

function canDepth(can: HTMLElement): number {
  const parsedIndex = Number.parseInt(can.dataset.canIndex ?? "0", 10);
  return Number.isNaN(parsedIndex) ? 1 : parsedIndex + 1;
}

function animateCanSettle(
  context: Parameters<SceneSetup>[0],
  cans: readonly HTMLElement[],
): void {
  cans.forEach((can, index): void => {
    context.gsap.from(can, {
      duration: MOTION_DURATION_SECONDS.entranceMax,
      ease: MOTION_EASE.settle,
      rotate:
        index % 2 === 0
          ? -CAN_ENTRY_ROTATION_DEGREES
          : CAN_ENTRY_ROTATION_DEGREES,
      y: index % 2 === 0 ? FLOAT_DISTANCE_PX : -FLOAT_DISTANCE_PX,
    });
  });
}

function animateTicker(context: Parameters<SceneSetup>[0]): void {
  const items = context.queryAll<HTMLElement>(TICKER_SELECTOR);
  if (items.length === 0) {
    return;
  }

  context.gsap.fromTo(
    items,
    { xPercent: 0 },
    {
      duration: MOTION_DURATION_SECONDS.entranceMax,
      ease: MOTION_EASE.material,
      xPercent: TICKER_SETTLE_X_PERCENT,
    },
  );
}

function animateSignalCapture(context: Parameters<SceneSetup>[0]): void {
  const signalFields = context.queryAll<HTMLElement>(SIGNAL_FIELD_SELECTOR);
  const word = context.query<HTMLElement>(WORD_SELECTOR);
  const band = context.query<HTMLElement>(BAND_SELECTOR);
  const supportingCopy = context.queryAll<HTMLElement>(
    SUPPORTING_COPY_SELECTOR,
  );
  const timeline = context.gsap.timeline();

  timeline
    .from(signalFields, {
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.material,
      scaleY: 0,
      stagger: SIGNAL_STAGGER_SECONDS,
      transformOrigin: "bottom center",
    })
    .from(
      word,
      {
        autoAlpha: 0,
        duration: MOTION_DURATION_SECONDS.scene,
        ease: MOTION_EASE.settle,
        yPercent: WORD_ENTRY_Y_PERCENT,
      },
      "-=0.28",
    )
    .from(
      band,
      {
        clipPath: "inset(0 100% 0 0)",
        duration: MOTION_DURATION_SECONDS.scene,
        ease: MOTION_EASE.material,
        rotate: BAND_ENTRY_ROTATION_DEGREES,
      },
      "-=0.62",
    )
    .from(
      supportingCopy,
      {
        autoAlpha: 0,
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.enter,
        stagger: SUPPORTING_COPY_STAGGER_SECONDS,
        y: COPY_ENTRY_Y_PX,
      },
      "-=0.34",
    );
}

function mountPointerParallax(
  context: Parameters<SceneSetup>[0],
  cans: readonly HTMLElement[],
): void {
  let pendingEvent: PointerEvent | null = null;
  let framePending = false;
  let cachedBounds: DOMRect | null = null;
  const setters = cans.map((can) => ({
    depth: canDepth(can),
    rotateY: context.gsap.quickSetter(can, "rotateY", "deg"),
    x: context.gsap.quickSetter(can, "x", "px"),
  }));
  const invalidateBounds = (): void => {
    cachedBounds = null;
  };

  const render = (): void => {
    framePending = false;
    const event = pendingEvent;
    pendingEvent = null;
    if (event === null) {
      return;
    }

    const bounds = cachedBounds ?? context.root.getBoundingClientRect();
    cachedBounds = bounds;
    const xRatio = (event.clientX - bounds.left) / bounds.width - 0.5;
    setters.forEach((setter): void => {
      Reflect.apply(setter.rotateY, undefined, [
        xRatio * MOTION_ROTATION_DEGREES.productTilt * setter.depth * 0.35,
      ]);
      Reflect.apply(setter.x, undefined, [
        xRatio * POINTER_DEPTH_PX * setter.depth,
      ]);
    });
  };

  context.listen(context.root, "pointermove", (event): void => {
    if (!(event instanceof PointerEvent)) {
      return;
    }
    pendingEvent = event;
    if (!framePending) {
      framePending = true;
      context.requestFrame(render);
    }
  });
  context.listen(context.root, "pointerleave", (): void => {
    pendingEvent = null;
    setters.forEach((setter): void => {
      Reflect.apply(setter.rotateY, undefined, [0]);
      Reflect.apply(setter.x, undefined, [0]);
    });
  });
  const windowValue = context.root.ownerDocument.defaultView;
  if (windowValue !== null) {
    context.listen(windowValue, "resize", invalidateBounds, { passive: true });
    context.listen(windowValue, "scroll", invalidateBounds, { passive: true });
  }
  context.onCleanup((): void => {
    setters.forEach((setter): void => {
      Reflect.apply(setter.rotateY, undefined, [0]);
      Reflect.apply(setter.x, undefined, [0]);
    });
  });
}

export const setupHero: SceneSetup = (context): (() => void) => {
  const cleanupReady = markSceneReady(context);
  if (context.capability.kind === "reduced") {
    return cleanupReady;
  }

  const cans = context.queryAll<HTMLElement>(CAN_SELECTOR);

  if (context.capability.kind === "full") {
    animateSignalCapture(context);
    animateCanSettle(context, cans);
    animateTicker(context);
    mountPointerParallax(context, cans);
  }

  return cleanupReady;
};
