import type { SceneSetup, SceneSetupContext } from "../create-scene";
import {
  MOTION_DISTANCE_PX,
  MOTION_DURATION_SECONDS,
  MOTION_EASE,
} from "../tokens";
import {
  createFiniteReveal,
  markSceneReady,
  playOnceWhenVisible,
} from "./shared";

const COMPARE_CHANNEL_SELECTOR = "[data-compare-product]:not([hidden])";
const COMPARE_COPY_SELECTOR = ".signal-channel__copy > *";
const COMPARE_PRODUCT_SELECTOR = "[data-motion-product]";
const COMPARE_RING_SELECTOR = ".signal-channel__rings";
const COMPARE_VERSUS_SELECTOR = ".selected-products__versus";
const PRESENTATION_SELECTOR = [
  COMPARE_PRODUCT_SELECTOR,
  COMPARE_RING_SELECTOR,
  COMPARE_COPY_SELECTOR,
  COMPARE_VERSUS_SELECTOR,
].join(", ");
const PRESENTATION_PROPERTIES = [
  "clip-path",
  "opacity",
  "rotate",
  "scale",
  "transform",
  "translate",
  "visibility",
] as const;
const COMPARE_ENTRY_ROTATION_DEGREES = 5;
const COMPARE_ENTRY_SCALE = 0.86;
const COMPARE_COPY_STAGGER_SECONDS = 0.045;

type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;
type SetupContext = Parameters<SceneSetup>[0];

interface KillableAnimation {
  kill(): void;
}

function clearPresentation(root: HTMLElement): void {
  root
    .querySelectorAll<HTMLElement>(PRESENTATION_SELECTOR)
    .forEach((element): void => {
      for (const property of PRESENTATION_PROPERTIES) {
        element.style.removeProperty(property);
      }
    });
}

function clearAfterContextRevert(root: HTMLElement): void {
  clearPresentation(root);
  queueMicrotask((): void => clearPresentation(root));
}

function animateChannel(
  context: SetupContext,
  timeline: SceneTimeline,
  channel: HTMLElement,
  index: number,
  count: number,
): void {
  const direction = count <= 1 || index % 2 === 0 ? -1 : 1;
  const product = channel.querySelector<HTMLElement>(COMPARE_PRODUCT_SELECTOR);
  const rings = channel.querySelector<HTMLElement>(COMPARE_RING_SELECTOR);
  const copy = Array.from(
    channel.querySelectorAll<HTMLElement>(COMPARE_COPY_SELECTOR),
  );
  timeline.from(
    product,
    {
      autoAlpha: 0,
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
      rotate:
        context.capability.kind === "full"
          ? direction * COMPARE_ENTRY_ROTATION_DEGREES
          : 0,
      scale: context.capability.kind === "full" ? COMPARE_ENTRY_SCALE : 0.96,
      x: direction * MOTION_DISTANCE_PX.copyReveal,
    },
    0,
  );
  timeline.from(
    rings,
    {
      autoAlpha: 0,
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
      scale: COMPARE_ENTRY_SCALE,
    },
    0.04,
  );
  timeline.from(
    copy,
    {
      autoAlpha: 0,
      clipPath: "inset(0 100% 0 0)",
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.enter,
      stagger: COMPARE_COPY_STAGGER_SECONDS,
    },
    0.14,
  );
}

function animateCompare(
  context: SetupContext,
  onComplete: () => void,
): SceneTimeline | null {
  const channels = context.queryAll<HTMLElement>(COMPARE_CHANNEL_SELECTOR);
  if (channels.length === 0 || context.capability.kind === "reduced") {
    return null;
  }
  const timeline = context.gsap.timeline({ onComplete });
  channels.forEach((channel, index): void => {
    animateChannel(context, timeline, channel, index, channels.length);
  });
  if (channels.length === 2) {
    timeline.from(
      context.query<HTMLElement>(COMPARE_VERSUS_SELECTOR),
      {
        autoAlpha: 0,
        clipPath: "inset(35% 0 35% 0)",
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.snap,
      },
      0.12,
    );
  }
  return timeline;
}

export const setupProductCompare: SceneSetup = (context): (() => void) => {
  let cancelFrame: (() => void) | null = null;
  let intent = 0;
  let timeline: KillableAnimation | null = null;
  const cleanupReady = markSceneReady(context);
  const schedule = (): void => {
    const activeIntent = ++intent;
    cancelFrame?.();
    cancelFrame = context.requestFrame((): void => {
      cancelFrame = null;
      if (activeIntent !== intent) return;
      timeline?.kill();
      clearPresentation(context.root);
      timeline = context.root.hasAttribute("data-compare-root")
        ? animateCompare(context, (): void => {
            if (activeIntent !== intent) return;
            clearPresentation(context.root);
            timeline = null;
          })
        : createFiniteReveal(context);
    });
  };

  playOnceWhenVisible(context, schedule);
  context.listen(context.root, "gorilla:selection-change", schedule);
  context.onCleanup((): void => {
    intent += 1;
    cancelFrame?.();
    timeline?.kill();
    clearAfterContextRevert(context.root);
    cancelFrame = null;
    timeline = null;
  });
  return cleanupReady;
};
