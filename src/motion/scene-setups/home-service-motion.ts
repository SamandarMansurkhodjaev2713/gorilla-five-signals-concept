import type { SceneSetup, SceneSetupContext } from "../create-scene";
import { MOTION_DURATION_SECONDS, MOTION_EASE } from "../tokens";
import {
  createFiniteReveal,
  markSceneReady,
  playOnceWhenVisible,
} from "./shared";

const HOME_SERVICE_CLASS = "home-service-dock";
const FAQ_HEADER_SELECTOR = ".home-service-dock__index header";
const FAQ_ROW_SELECTOR = ".home-service-dock__questions details";
const FAQ_ACTION_SELECTOR = ".home-service-dock__questions > .control";
const CONTACT_ROOT_SELECTOR = ".home-service-dock__contact";
const CONTACT_WORD_SELECTOR = ".home-service-dock__contact-word";
const CONTACT_COPY_SELECTOR = [
  ".home-service-dock__contact > .type-label",
  ".home-service-dock__contact > strong",
  ".home-service-dock__contact > small",
  ".home-service-dock__contact > b",
  ".home-service-dock__contact > i",
].join(", ");
const PRESENTATION_SELECTOR = [
  FAQ_HEADER_SELECTOR,
  FAQ_ROW_SELECTOR,
  FAQ_ACTION_SELECTOR,
  CONTACT_ROOT_SELECTOR,
  CONTACT_WORD_SELECTOR,
  CONTACT_COPY_SELECTOR,
].join(", ");
const PRESENTATION_PROPERTIES = ["clip-path", "opacity"] as const;
const SERVICE_STAGGER_SECONDS = 0.055;

type SetupContext = Parameters<SceneSetup>[0];
type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;

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

function animateFaqIndex(context: SetupContext, timeline: SceneTimeline): void {
  timeline.from(context.query<HTMLElement>(FAQ_HEADER_SELECTOR), {
    opacity: 0,
    clipPath: "inset(0 0 100% 0)",
    duration: MOTION_DURATION_SECONDS.scene,
    ease: MOTION_EASE.enter,
  });
  timeline.from(
    context.queryAll<HTMLElement>(FAQ_ROW_SELECTOR),
    {
      opacity: 0,
      clipPath: "inset(0 100% 0 0)",
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.enter,
      stagger: SERVICE_STAGGER_SECONDS,
    },
    0.12,
  );
  timeline.from(
    context.query<HTMLElement>(FAQ_ACTION_SELECTOR),
    {
      opacity: 0,
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.enter,
    },
    0.26,
  );
}

function animateContactHandoff(
  context: SetupContext,
  timeline: SceneTimeline,
): void {
  timeline.from(
    context.query<HTMLElement>(CONTACT_ROOT_SELECTOR),
    {
      opacity: 0,
      clipPath: "inset(8% 0 8% 0)",
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
    },
    0.3,
  );
  if (context.capability.kind !== "full") return;
  timeline.from(
    context.query<HTMLElement>(CONTACT_WORD_SELECTOR),
    {
      opacity: 0,
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
    },
    0.36,
  );
  timeline.from(
    context.queryAll<HTMLElement>(CONTACT_COPY_SELECTOR),
    {
      opacity: 0,
      clipPath: "inset(0 0 100% 0)",
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.enter,
      stagger: SERVICE_STAGGER_SECONDS,
    },
    0.44,
  );
}

function createServiceHandoff(context: SetupContext): void {
  const clear = (): void => clearPresentation(context.root);
  const timeline = context.gsap.timeline({ onComplete: clear });
  animateFaqIndex(context, timeline);
  animateContactHandoff(context, timeline);
}

function setupHomeService(context: SetupContext): () => void {
  const cleanupReady = markSceneReady(context);
  context.onCleanup((): void => clearAfterContextRevert(context.root));
  if (context.capability.kind !== "reduced") {
    playOnceWhenVisible(context, (): void => createServiceHandoff(context));
  }
  return cleanupReady;
}

export const setupFaqScene: SceneSetup = (context): (() => void) => {
  if (context.root.classList.contains(HOME_SERVICE_CLASS)) {
    return setupHomeService(context);
  }
  const cleanupReady = markSceneReady(context);
  playOnceWhenVisible(context, (): void => {
    createFiniteReveal(context);
  });
  return cleanupReady;
};

export const setupContactScene: SceneSetup = (context): (() => void) =>
  markSceneReady(context);
