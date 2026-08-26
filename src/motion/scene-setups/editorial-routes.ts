import type { SceneSetup, SceneSetupContext } from "../create-scene";
import {
  MOTION_DISTANCE_PX,
  MOTION_DURATION_SECONDS,
  MOTION_EASE,
  MOTION_STAGGER_SECONDS,
} from "../tokens";
import { requireMotionHook, setupDeferredScene } from "./shared";

const CULTURE_CHAPTER_SELECTOR = "[data-motion-culture-chapter]";
const FIND_FIELD_SELECTOR = "[data-motion-find-field]";
const FIND_MARKER_SELECTOR = "[data-motion-find-marker]";
const FIND_VISUAL_SELECTOR = "[data-motion-find-visual]:not([hidden])";
const CONTACT_RAIL_SELECTOR = "[data-motion-contact-rail]";
const LOCATOR_ACTION_SELECTOR = "[data-locator-google]";
const LOCATOR_EVENT = "gorilla:locator-change";
const ENTRY_CLIP = "inset(0 0 22% 0)";
const ACTION_ENTRY_SCALE_X = 0.94;
const MARKER_ENTRY_ROTATION_DEGREES = 34;
const MARKER_ENTRY_SCALE = 0.72;
const VISUAL_ENTRY_SCALE = 0.92;

type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;

function animateCultureAtlas(context: SceneSetupContext): void {
  const chapters = context.queryAll<HTMLElement>(CULTURE_CHAPTER_SELECTOR);
  if (chapters.length === 0) {
    throw new Error(`Scene hook is missing: ${CULTURE_CHAPTER_SELECTOR}`);
  }
  if (context.capability.kind === "reduced") {
    return;
  }
  context.gsap.from(chapters, {
    clipPath: ENTRY_CLIP,
    duration: MOTION_DURATION_SECONDS.scene,
    ease: MOTION_EASE.material,
    stagger: MOTION_STAGGER_SECONDS.tight,
    y: MOTION_DISTANCE_PX.panelReveal,
  });
}

function animateFindEntry(context: SceneSetupContext): void {
  const field = requireMotionHook(context, FIND_FIELD_SELECTOR);
  const marker = requireMotionHook(context, FIND_MARKER_SELECTOR);
  if (context.capability.kind === "reduced") {
    return;
  }
  context.gsap
    .timeline()
    .from(field, {
      clipPath: ENTRY_CLIP,
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
    })
    .from(
      marker,
      {
        duration: MOTION_DURATION_SECONDS.scene,
        ease: MOTION_EASE.settle,
        rotate: MARKER_ENTRY_ROTATION_DEGREES,
        scale: MARKER_ENTRY_SCALE,
      },
      0,
    );
}

function animateFindSelection(
  context: SceneSetupContext,
): SceneTimeline | null {
  if (context.capability.kind === "reduced") {
    return null;
  }
  const visual = context.query<HTMLElement>(FIND_VISUAL_SELECTOR);
  const action = requireMotionHook(context, LOCATOR_ACTION_SELECTOR);
  const timeline = context.gsap.timeline();
  if (visual !== null) {
    timeline.from(visual, {
      autoAlpha: 0,
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.material,
      scale: VISUAL_ENTRY_SCALE,
      y: MOTION_DISTANCE_PX.copyReveal,
    });
  }
  timeline.from(
    action,
    {
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.snap,
      scaleX: ACTION_ENTRY_SCALE_X,
      transformOrigin: "left center",
    },
    0,
  );
  return timeline;
}

function bindFindSelection(context: SceneSetupContext): void {
  let activeTimeline: SceneTimeline | null = null;
  context.listen(context.root, LOCATOR_EVENT, (): void => {
    context.runOwned((): void => {
      activeTimeline?.kill();
      activeTimeline = animateFindSelection(context);
    });
  });
  context.onCleanup((): void => {
    activeTimeline?.kill();
  });
}

function animateContactSwitchboard(context: SceneSetupContext): void {
  const rails = context.queryAll<HTMLElement>(CONTACT_RAIL_SELECTOR);
  if (rails.length === 0) {
    throw new Error(`Scene hook is missing: ${CONTACT_RAIL_SELECTOR}`);
  }
  if (context.capability.kind === "reduced") {
    return;
  }
  context.gsap.from(rails, {
    duration: MOTION_DURATION_SECONDS.scene,
    ease: MOTION_EASE.snap,
    scaleX: 0,
    stagger: MOTION_STAGGER_SECONDS.tight,
    transformOrigin: "left center",
  });
}

export const setupCultureAtlasScene: SceneSetup = (context) =>
  setupDeferredScene(context, animateCultureAtlas);

export const setupFindHandoffScene: SceneSetup = (context): (() => void) => {
  bindFindSelection(context);
  return setupDeferredScene(context, animateFindEntry);
};

export const setupContactSwitchboardScene: SceneSetup = (context) =>
  setupDeferredScene(context, animateContactSwitchboard);
