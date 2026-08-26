import type { SceneSetup, SceneSetupContext } from "../create-scene";
import { setupFlavorReactor } from "../../features/flavor-reactor/flavor-reactor-motion";
import {
  MOTION_DISTANCE_PX,
  MOTION_DURATION_SECONDS,
  MOTION_EASE,
} from "../tokens";
import { markSceneReady, playOnceWhenVisible } from "./shared";
export { setupProductDetailWorld as setupProductLab } from "./product-detail-world-motion";

const SELECTOR_SELECTOR = "[data-motion-select]";
const SELECTED_SELECTOR = "[data-motion-selected]";
const RESULT_SELECTOR = "[data-motion-result]";
const PRODUCT_SELECTOR = "[data-motion-product]";
const COMPARE_CHANNEL_SELECTOR = "[data-compare-product]:not([hidden])";
const COMPARE_COPY_SELECTOR = ".signal-channel__copy > *";
const COMPARE_RING_SELECTOR = ".signal-channel__rings";
const COMPARE_VERSUS_SELECTOR = ".selected-products__versus";
const COMPARE_ENTRY_ROTATION_DEGREES = 5;
const COMPARE_RING_ROTATION_DEGREES = 18;
const COMPARE_ENTRY_SCALE = 0.86;
const COMPARE_VERSUS_ENTRY_SCALE = 0.24;
const COMPARE_COPY_STAGGER_SECONDS = 0.045;

interface KillableAnimation {
  kill(): void;
}

type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;
type TweenVars = Parameters<SceneSetupContext["gsap"]["to"]>[1];

const PRODUCT_ENTRANCES: Readonly<Record<string, TweenVars>> = {
  original: {
    rotate: -2,
    scale: 0.86,
    y: MOTION_DISTANCE_PX.panelReveal,
  },
  zero: {
    opacity: 0.7,
    scaleX: 0.88,
    x: -MOTION_DISTANCE_PX.copyReveal,
  },
  extra: {
    scaleX: 0.82,
    y: MOTION_DISTANCE_PX.copyReveal,
  },
  "mango-coconut": {
    rotate: -4,
    x: -MOTION_DISTANCE_PX.copyReveal,
    y: MOTION_DISTANCE_PX.copyReveal,
  },
  "lychee-pear": {
    opacity: 0.58,
    scale: 0.94,
    x: MOTION_DISTANCE_PX.copyReveal,
  },
};

function selectedTarget(
  context: Parameters<SceneSetup>[0],
): HTMLElement | null {
  return (
    context.query<HTMLElement>(SELECTED_SELECTOR) ??
    context.query<HTMLElement>(PRODUCT_SELECTOR) ??
    context.query<HTMLElement>(RESULT_SELECTOR)
  );
}

function createSelectionTimeline(
  context: Parameters<SceneSetup>[0],
): SceneTimeline {
  return context.gsap.timeline({ defaults: { overwrite: true } });
}

function revealSelectedProduct(context: Parameters<SceneSetup>[0]): void {
  const target = selectedTarget(context);
  if (target === null || context.capability.kind === "reduced") {
    return;
  }
  context.gsap.from(target, {
    duration: MOTION_DURATION_SECONDS.scene,
    ease: MOTION_EASE.enter,
    y:
      context.capability.kind === "full"
        ? MOTION_DISTANCE_PX.panelReveal
        : MOTION_DISTANCE_PX.copyReveal,
  });
}

function productEntrance(context: Parameters<SceneSetup>[0]): TweenVars {
  if (context.capability.kind !== "full") {
    return { opacity: 0.72, scale: 0.96 };
  }
  const flavorRoot = context.root.closest<HTMLElement>("[data-flavor]");
  const slug =
    context.root.dataset.selectedProduct ?? flavorRoot?.dataset.flavor ?? "";
  return PRODUCT_ENTRANCES[slug] ?? PRODUCT_ENTRANCES.original ?? {};
}

function animateProduct(
  context: Parameters<SceneSetup>[0],
  timeline: SceneTimeline,
  product: HTMLElement | null,
): void {
  if (!product) {
    return;
  }
  timeline.fromTo(
    product,
    productEntrance(context),
    {
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
      force3D: true,
      opacity: 1,
      rotate: 0,
      scale: 1,
      scaleX: 1,
      x: 0,
      y: 0,
    },
    0,
  );
}

function animatePlane(
  timeline: SceneTimeline,
  plane: HTMLElement | null,
): void {
  if (!plane) {
    return;
  }
  timeline.fromTo(
    plane,
    { scaleX: 0, transformOrigin: "left center" },
    {
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.enter,
      force3D: true,
      scaleX: 1,
    },
    0,
  );
}

function compareDirection(index: number, channelCount: number): number {
  if (channelCount <= 1) {
    return 0;
  }
  return index % 2 === 0 ? -1 : 1;
}

function animateCompareSelection(
  context: Parameters<SceneSetup>[0],
): KillableAnimation | null {
  const channels = context.queryAll<HTMLElement>(COMPARE_CHANNEL_SELECTOR);
  if (channels.length === 0 || context.capability.kind === "reduced") {
    return null;
  }

  const timeline = createSelectionTimeline(context);
  channels.forEach((channel, index): void => {
    const direction = compareDirection(index, channels.length);
    const product = channel.querySelector<HTMLElement>(PRODUCT_SELECTOR);
    const rings = channel.querySelector<HTMLElement>(COMPARE_RING_SELECTOR);
    const copy = Array.from(
      channel.querySelectorAll<HTMLElement>(COMPARE_COPY_SELECTOR),
    );

    if (product !== null) {
      timeline.fromTo(
        product,
        {
          opacity: 0.4,
          rotate: direction * COMPARE_ENTRY_ROTATION_DEGREES,
          scale: COMPARE_ENTRY_SCALE,
          x: direction * MOTION_DISTANCE_PX.panelReveal,
        },
        {
          duration: MOTION_DURATION_SECONDS.scene,
          ease: MOTION_EASE.material,
          force3D: true,
          opacity: 1,
          rotate: 0,
          scale: 1,
          x: 0,
        },
        0,
      );
    }
    if (rings !== null) {
      timeline.from(
        rings,
        {
          duration: MOTION_DURATION_SECONDS.scene,
          ease: MOTION_EASE.material,
          opacity: 0,
          rotate: direction * COMPARE_RING_ROTATION_DEGREES,
          scale: COMPARE_ENTRY_SCALE,
        },
        0,
      );
    }
    if (copy.length > 0) {
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
  });

  if (channels.length === 2) {
    const versus = context.query<HTMLElement>(COMPARE_VERSUS_SELECTOR);
    if (versus !== null) {
      timeline.from(
        versus,
        {
          autoAlpha: 0,
          duration: MOTION_DURATION_SECONDS.standard,
          ease: MOTION_EASE.settle,
          scale: COMPARE_VERSUS_ENTRY_SCALE,
        },
        0.12,
      );
    }
  }

  return timeline;
}

function animateSelection(
  context: Parameters<SceneSetup>[0],
  timeline: KillableAnimation | null,
): KillableAnimation | null {
  timeline?.kill();
  const target = selectedTarget(context);

  if (!target || context.capability.kind === "reduced") {
    return null;
  }

  if (context.root.hasAttribute("data-compare-root")) {
    return animateCompareSelection(context);
  }

  const product = target.querySelector<HTMLElement>(PRODUCT_SELECTOR);
  const plane = target.querySelector<HTMLElement>(".flavor-plane");
  const nextTimeline = createSelectionTimeline(context);
  animateProduct(context, nextTimeline, product);
  animatePlane(nextTimeline, plane);
  return nextTimeline;
}

const setupGenericInteractiveProduct: SceneSetup = (context): (() => void) => {
  let selectionTimeline: KillableAnimation | null = null;
  let cancelPendingFrame: (() => void) | null = null;
  const cleanupReady = markSceneReady(context);
  playOnceWhenVisible(context, (): void => revealSelectedProduct(context));

  const scheduleSelection = (): void => {
    cancelPendingFrame?.();
    cancelPendingFrame = context.requestFrame((): void => {
      cancelPendingFrame = null;
      selectionTimeline = animateSelection(context, selectionTimeline);
    });
  };

  const handleSelection = (event: Event): void => {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (event.target.closest(SELECTOR_SELECTOR)) {
      scheduleSelection();
    }
  };

  context.listen(context.root, "click", handleSelection);
  context.listen(context.root, "change", handleSelection);
  context.listen(context.root, "gorilla:selection-change", scheduleSelection);
  context.onCleanup((): void => {
    cancelPendingFrame?.();
    selectionTimeline?.kill();
  });

  return cleanupReady;
};

export const setupInteractiveProduct: SceneSetup = (
  context,
): void | (() => void) => {
  if (context.root.hasAttribute("data-product-explorer")) {
    return setupFlavorReactor(context);
  }
  return setupGenericInteractiveProduct(context);
};
