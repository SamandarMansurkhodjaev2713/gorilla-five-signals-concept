import type { SceneSetup, SceneSetupContext } from "../create-scene";
import { MOTION_DURATION_SECONDS, MOTION_EASE } from "../tokens";
import { markSceneReady, playOnceWhenVisible } from "./shared";

const TRUTH_TARGETS = [
  ".home-truth__handoff",
  ".home-truth__heading",
  ".home-truth__register li",
  ".home-truth__responsibility",
].join(", ");
const DUEL_TARGETS = [
  ".home-duel__product",
  ".home-duel__beam",
  ".home-duel__frequency",
  ".home-duel__action",
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
const TRUTH_ROW_STAGGER_SECONDS = 0.055;

type SetupContext = Parameters<SceneSetup>[0];
type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;

function clearPresentation(root: HTMLElement, selector: string): void {
  root.querySelectorAll<HTMLElement>(selector).forEach((element): void => {
    for (const property of PRESENTATION_PROPERTIES) {
      element.style.removeProperty(property);
    }
  });
}

function clearAfterContextRevert(root: HTMLElement, selector: string): void {
  clearPresentation(root, selector);
  queueMicrotask((): void => clearPresentation(root, selector));
}

function createTruthTimeline(context: SetupContext): void {
  const heading = context.query<HTMLElement>(".home-truth__heading");
  const rows = context.queryAll<HTMLElement>(".home-truth__register li");
  const responsibility = context.query<HTMLElement>(
    ".home-truth__responsibility",
  );
  const handoff = context.query<HTMLElement>(".home-truth__handoff");
  const clear = (): void => clearPresentation(context.root, TRUTH_TARGETS);
  const timeline = context.gsap.timeline({ onComplete: clear });
  timeline.from(heading, {
    autoAlpha: 0,
    clipPath: "inset(0 0 100% 0)",
    duration: MOTION_DURATION_SECONDS.scene,
    ease: MOTION_EASE.enter,
  });
  timeline.from(
    rows,
    {
      autoAlpha: 0,
      clipPath: "inset(0 100% 0 0)",
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.enter,
      stagger: TRUTH_ROW_STAGGER_SECONDS,
    },
    "-=0.34",
  );
  timeline.from(
    responsibility,
    {
      autoAlpha: 0,
      clipPath: "inset(18% 0 0 0)",
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
    },
    "-=0.28",
  );
  if (context.capability.kind === "full") {
    timeline.from(
      handoff,
      {
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.snap,
        clipPath: "inset(0 0 100% 0)",
      },
      0,
    );
  }
}

function animateDuelProducts(
  context: SetupContext,
  timeline: SceneTimeline,
): void {
  const products = context.queryAll<HTMLElement>(".home-duel__product");
  products.forEach((product, index): void => {
    const clipFrom = index === 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)";
    timeline.from(
      product,
      {
        autoAlpha: 0,
        clipPath: clipFrom,
        duration: MOTION_DURATION_SECONDS.scene,
        ease: MOTION_EASE.material,
      },
      0,
    );
  });
}

function createDuelTimeline(context: SetupContext): void {
  const beam = context.query<HTMLElement>(".home-duel__beam");
  const frequencies = context.queryAll<HTMLElement>(".home-duel__frequency");
  const action = context.query<HTMLElement>(".home-duel__action");
  const clear = (): void => clearPresentation(context.root, DUEL_TARGETS);
  const timeline = context.gsap.timeline({ onComplete: clear });

  animateDuelProducts(context, timeline);
  timeline.from(
    beam,
    {
      clipPath: "inset(50% 0 50% 0)",
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.snap,
    },
    0.12,
  );
  timeline.from(
    frequencies,
    {
      autoAlpha: 0,
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.enter,
      stagger: TRUTH_ROW_STAGGER_SECONDS,
      clipPath: "inset(0 0 100% 0)",
    },
    0.2,
  );
  timeline.from(
    action,
    {
      autoAlpha: 0,
      clipPath: "inset(0 100% 0 0)",
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.enter,
    },
    0.28,
  );
}

function setupFiniteHomeScene(
  context: SetupContext,
  selector: string,
  animate: (value: SetupContext) => void,
): () => void {
  const cleanupReady = markSceneReady(context);
  context.onCleanup((): void =>
    clearAfterContextRevert(context.root, selector),
  );
  if (context.capability.kind !== "reduced") {
    playOnceWhenVisible(context, (): void => animate(context));
  }
  return cleanupReady;
}

export const setupHomeTruth: SceneSetup = (context): (() => void) =>
  setupFiniteHomeScene(context, TRUTH_TARGETS, createTruthTimeline);

export const setupHomeDuel: SceneSetup = (context): (() => void) =>
  setupFiniteHomeScene(context, DUEL_TARGETS, createDuelTimeline);
