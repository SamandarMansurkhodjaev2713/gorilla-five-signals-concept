import type { SceneSetupContext } from "../create-scene";
import {
  MOTION_DISTANCE_PX,
  MOTION_DURATION_SECONDS,
  MOTION_EASE,
} from "../tokens";

const REVEAL_SELECTOR = "[data-motion-reveal]";
const COPY_SELECTOR = "[data-motion-copy]";
const SIGNAL_SELECTOR = "[data-motion-signal]";
type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;
type SceneTween = ReturnType<SceneSetupContext["gsap"]["from"]>;

export function markSceneReady(context: SceneSetupContext): () => void {
  context.root.dataset.motionReady = context.capability.kind;
  return (): void => {
    delete context.root.dataset.motionReady;
  };
}

export function requireMotionHook(
  context: SceneSetupContext,
  selector: string,
): HTMLElement {
  const element = context.query<HTMLElement>(selector);
  if (element === null) {
    throw new Error(`Scene hook is missing: ${selector}`);
  }
  return element;
}

export function createFiniteReveal(
  context: SceneSetupContext,
): SceneTween | null {
  const targets = context.queryAll<HTMLElement>(REVEAL_SELECTOR);

  if (context.capability.kind === "reduced" || targets.length === 0) {
    return null;
  }

  const distance =
    context.capability.kind === "full"
      ? MOTION_DISTANCE_PX.panelReveal
      : MOTION_DISTANCE_PX.copyReveal;

  return context.gsap.from(targets, {
    duration: MOTION_DURATION_SECONDS.scene,
    ease: MOTION_EASE.enter,
    stagger: MOTION_DURATION_SECONDS.instant,
    y: distance,
  });
}

export function createSignalSequence(
  context: SceneSetupContext,
): SceneTimeline | null {
  const copy = context.queryAll<HTMLElement>(COPY_SELECTOR);
  const signals = context.queryAll<HTMLElement>(SIGNAL_SELECTOR);

  if (context.capability.kind === "reduced" || signals.length === 0) {
    return null;
  }

  const timeline = context.gsap.timeline();
  timeline.from(signals, {
    duration: MOTION_DURATION_SECONDS.standard,
    ease: MOTION_EASE.snap,
    scaleX: 0,
    stagger: MOTION_DURATION_SECONDS.instant / 2,
    transformOrigin: "left center",
  });

  if (copy.length > 0) {
    timeline.from(
      copy,
      {
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.enter,
        y: MOTION_DISTANCE_PX.copyReveal,
      },
      "-=0.08",
    );
  }

  return timeline;
}

export function playOnceWhenVisible(
  context: SceneSetupContext,
  play: () => void,
): void {
  const observer = new IntersectionObserver(
    (entries): void => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return;
      }

      observer.disconnect();
      context.runOwned(play);
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
  );

  observer.observe(context.root);
  context.ownObserver(observer);
}

export function setupDeferredScene(
  context: SceneSetupContext,
  animate: (value: SceneSetupContext) => void,
): () => void {
  const cleanupReady = markSceneReady(context);
  playOnceWhenVisible(context, (): void => {
    createFiniteReveal(context);
    animate(context);
  });
  return cleanupReady;
}
