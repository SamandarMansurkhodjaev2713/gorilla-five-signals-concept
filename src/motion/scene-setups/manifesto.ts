import type { SceneSetup } from "../create-scene";
import { MOTION_DURATION_SECONDS, MOTION_EASE } from "../tokens";
import { markSceneReady, playOnceWhenVisible } from "./shared";

const LINE_SELECTOR = "[data-manifesto-line]";
const SIGNAL_SELECTOR = "[data-motion-signal]";
const HANDOFF_SELECTOR = ".manifesto-handoff";
const TRANSMISSION_SELECTOR = ".manifesto-transmission > span";
const LINE_STAGGER_SECONDS = 0.075;
const SIGNAL_STAGGER_SECONDS = 0.045;
const SUPPORTING_COPY_SELECTOR = ".manifesto-intro";
const SUPPORTING_COPY_OFFSET_PX = 24;

function revealManifesto(context: Parameters<SceneSetup>[0]): void {
  const lines = context.queryAll<HTMLElement>(LINE_SELECTOR);
  const signals = context.queryAll<HTMLElement>(SIGNAL_SELECTOR);
  const handoff = context.query<HTMLElement>(HANDOFF_SELECTOR);
  const transmission = context.queryAll<HTMLElement>(TRANSMISSION_SELECTOR);
  const supportingCopy = context.query<HTMLElement>(SUPPORTING_COPY_SELECTOR);
  const timeline = context.gsap.timeline();

  timeline
    .from(handoff, {
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.material,
      scaleY: 0,
      transformOrigin: "top center",
    })
    .from(lines, {
      duration: MOTION_DURATION_SECONDS.scene,
      clipPath: "inset(0 100% 0 0)",
      ease: MOTION_EASE.material,
      stagger: LINE_STAGGER_SECONDS,
    })
    .from(
      supportingCopy,
      {
        autoAlpha: 0,
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.enter,
        y: SUPPORTING_COPY_OFFSET_PX,
      },
      "-=0.42",
    )
    .from(
      transmission,
      {
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.material,
        scaleX: 0,
        stagger: SIGNAL_STAGGER_SECONDS,
        transformOrigin: "left center",
      },
      "-=0.24",
    )
    .from(
      signals,
      {
        autoAlpha: 0,
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.enter,
        stagger: SIGNAL_STAGGER_SECONDS,
        y: SUPPORTING_COPY_OFFSET_PX,
      },
      "-=0.3",
    );
}

export const setupManifesto: SceneSetup = (context): (() => void) => {
  const cleanupReady = markSceneReady(context);
  if (context.capability.kind === "reduced") {
    return cleanupReady;
  }

  playOnceWhenVisible(context, (): void => revealManifesto(context));

  return cleanupReady;
};
