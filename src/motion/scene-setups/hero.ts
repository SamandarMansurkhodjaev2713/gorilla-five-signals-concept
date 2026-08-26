import type { SceneSetup } from "../create-scene";
import { MOTION_DURATION_SECONDS, MOTION_EASE } from "../tokens";
import { markSceneReady } from "./shared";

const FREQUENCY_SELECTOR = "[data-motion-hero-frequency]";
const GHOST_CAN_SELECTOR = "[data-hero-ghost]";
const ORBIT_SELECTOR = "[data-motion-hero-orbit]";
const PRIMARY_CAN_SELECTOR = "[data-hero-primary-can]";
const SIGNAL_PLATE_SELECTOR = "[data-motion-hero-band]";
const SUPPORT_SELECTOR = "[data-motion-hero-support]";
const TITLE_SELECTOR = "[data-motion-hero-title]";
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const CAN_ENTRY_ROTATION_DEGREES = -7;
const CAN_ENTRY_SCALE = 0.76;
const CAN_ENTRY_Y_PX = 112;
const FREQUENCY_STAGGER_SECONDS = 0.045;
const GHOST_ENTRY_SCALE = 0.82;
const GHOST_ENTRY_X_PX = 44;
const GHOST_STAGGER_SECONDS = 0.04;
const POINTER_CAN_ROTATION_DEGREES = 2.2;
const POINTER_CAN_X_PX = 10;
const POINTER_ORBIT_X_PX = 16;
const SUPPORT_ENTRY_Y_PX = 18;
const SUPPORT_STAGGER_SECONDS = 0.05;
const TITLE_ENTRY_Y_PERCENT = 104;

function animateSignalBoot(context: Parameters<SceneSetup>[0]): void {
  const primaryCan = context.query<HTMLElement>(PRIMARY_CAN_SELECTOR);
  const signalPlate = context.query<HTMLElement>(SIGNAL_PLATE_SELECTOR);
  const timeline = context.gsap.timeline();

  timeline
    .from(context.queryAll(FREQUENCY_SELECTOR), {
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.material,
      scaleY: 0,
      stagger: FREQUENCY_STAGGER_SECONDS,
      transformOrigin: "top center",
    })
    .from(
      context.queryAll(TITLE_SELECTOR),
      {
        clipPath: "inset(0 0 100% 0)",
        duration: MOTION_DURATION_SECONDS.scene,
        ease: MOTION_EASE.enter,
        stagger: FREQUENCY_STAGGER_SECONDS,
        yPercent: TITLE_ENTRY_Y_PERCENT,
      },
      "-=0.12",
    );

  if (primaryCan !== null) {
    timeline.from(
      primaryCan,
      {
        duration: MOTION_DURATION_SECONDS.entranceMax,
        ease: MOTION_EASE.settle,
        rotate: CAN_ENTRY_ROTATION_DEGREES,
        scale: CAN_ENTRY_SCALE,
        y: CAN_ENTRY_Y_PX,
      },
      "-=0.58",
    );
  }

  if (signalPlate !== null) {
    timeline.from(
      signalPlate,
      {
        clipPath: "inset(0 100% 0 0)",
        duration: MOTION_DURATION_SECONDS.scene,
        ease: MOTION_EASE.material,
      },
      "-=0.54",
    );
  }

  timeline
    .from(
      context.queryAll(GHOST_CAN_SELECTOR),
      {
        autoAlpha: 0,
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.enter,
        scale: GHOST_ENTRY_SCALE,
        stagger: GHOST_STAGGER_SECONDS,
        x: GHOST_ENTRY_X_PX,
      },
      "-=0.3",
    )
    .from(
      context.queryAll(SUPPORT_SELECTOR),
      {
        autoAlpha: 0,
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.enter,
        stagger: SUPPORT_STAGGER_SECONDS,
        y: SUPPORT_ENTRY_Y_PX,
      },
      "-=0.18",
    );
}

function mountPointerDepth(context: Parameters<SceneSetup>[0]): void {
  const windowValue = context.root.ownerDocument.defaultView;
  const primaryCan = context.query<HTMLElement>(PRIMARY_CAN_SELECTOR);
  const orbit = context.query<HTMLElement>(ORBIT_SELECTOR);
  if (
    windowValue === null ||
    primaryCan === null ||
    !windowValue.matchMedia(FINE_POINTER_QUERY).matches
  ) {
    return;
  }

  const canRotation = context.gsap.quickSetter(primaryCan, "rotateY", "deg");
  const canX = context.gsap.quickSetter(primaryCan, "x", "px");
  const orbitX =
    orbit === null ? null : context.gsap.quickSetter(orbit, "x", "px");
  let bounds: DOMRect | null = null;
  let pendingEvent: PointerEvent | null = null;
  let pendingFrame = false;

  const reset = (): void => {
    Reflect.apply(canRotation, undefined, [0]);
    Reflect.apply(canX, undefined, [0]);
    if (orbitX !== null) Reflect.apply(orbitX, undefined, [0]);
  };
  const render = (): void => {
    pendingFrame = false;
    const event = pendingEvent;
    pendingEvent = null;
    const frame = bounds ?? context.root.getBoundingClientRect();
    bounds = frame;
    if (event === null || frame.width <= 0) return;
    const ratio = (event.clientX - frame.left) / frame.width - 0.5;
    Reflect.apply(canRotation, undefined, [
      ratio * POINTER_CAN_ROTATION_DEGREES,
    ]);
    Reflect.apply(canX, undefined, [ratio * POINTER_CAN_X_PX]);
    if (orbitX !== null)
      Reflect.apply(orbitX, undefined, [-ratio * POINTER_ORBIT_X_PX]);
  };

  context.listen(context.root, "pointermove", (event): void => {
    if (!(event instanceof PointerEvent)) return;
    pendingEvent = event;
    if (pendingFrame) return;
    pendingFrame = true;
    context.requestFrame(render);
  });
  context.listen(context.root, "pointerleave", reset);
  context.listen(windowValue, "resize", (): void => {
    bounds = null;
  });
  context.onCleanup(reset);
}

export const setupHero: SceneSetup = (context): (() => void) => {
  const cleanupReady = markSceneReady(context);
  if (context.capability.kind !== "full") return cleanupReady;

  animateSignalBoot(context);
  mountPointerDepth(context);
  return cleanupReady;
};
