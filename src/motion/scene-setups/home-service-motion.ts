import type { SceneSetup, SceneSetupContext } from "../create-scene";
import { publishMotionDiagnostic } from "../diagnostics";
import { MOTION_EASE } from "../tokens";
import { HomeServiceEntranceOwner } from "./home-service-entrance-owner";
import {
  SERVICE_ACTION_SELECTOR,
  SERVICE_CONTACT_COPY_SELECTOR,
  SERVICE_CONTACT_SELECTOR,
  SERVICE_CONTACT_WORD_SELECTOR,
  SERVICE_HEADER_SELECTOR,
  SERVICE_ROW_SELECTOR,
} from "./home-service-motion-contract";
import { HOME_SERVICE_TIMING_SECONDS } from "./home-service-motion-spec";
import {
  createFiniteReveal,
  markSceneReady,
  playOnceWhenVisible,
} from "./shared";

const HOME_SERVICE_CLASS = "home-service-dock";

type SetupContext = Parameters<SceneSetup>[0];
type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;

function animateFaqIndex(context: SetupContext, timeline: SceneTimeline): void {
  const timing = HOME_SERVICE_TIMING_SECONDS;
  timeline.from(context.query<HTMLElement>(SERVICE_HEADER_SELECTOR), {
    opacity: 0,
    clipPath: "inset(0 0 100% 0)",
    duration: timing.sceneDuration,
    ease: MOTION_EASE.enter,
  });
  timeline.from(
    context.queryAll<HTMLElement>(SERVICE_ROW_SELECTOR),
    {
      opacity: 0,
      clipPath: "inset(0 100% 0 0)",
      duration: timing.standardDuration,
      ease: MOTION_EASE.enter,
      stagger: timing.stagger,
    },
    timing.rowDelay,
  );
  timeline.from(
    context.query<HTMLElement>(SERVICE_ACTION_SELECTOR),
    {
      opacity: 0,
      duration: timing.standardDuration,
      ease: MOTION_EASE.enter,
    },
    timing.actionDelay,
  );
}

function animateFullContact(
  context: SetupContext,
  timeline: SceneTimeline,
): void {
  const timing = HOME_SERVICE_TIMING_SECONDS;
  timeline.from(
    context.query<HTMLElement>(SERVICE_CONTACT_WORD_SELECTOR),
    {
      opacity: 0,
      duration: timing.sceneDuration,
      ease: MOTION_EASE.material,
    },
    timing.contactWordDelay,
  );
  timeline.from(
    context.queryAll<HTMLElement>(SERVICE_CONTACT_COPY_SELECTOR),
    {
      opacity: 0,
      clipPath: "inset(0 0 100% 0)",
      duration: timing.standardDuration,
      ease: MOTION_EASE.enter,
      stagger: timing.stagger,
    },
    timing.contactCopyDelay,
  );
}

function animateContactHandoff(
  context: SetupContext,
  timeline: SceneTimeline,
): void {
  const timing = HOME_SERVICE_TIMING_SECONDS;
  timeline.from(
    context.query<HTMLElement>(SERVICE_CONTACT_SELECTOR),
    {
      opacity: 0,
      clipPath: "inset(8% 0 8% 0)",
      duration: timing.sceneDuration,
      ease: MOTION_EASE.material,
    },
    timing.contactDelay,
  );
  if (context.capability.kind === "full") animateFullContact(context, timeline);
}

function createServiceHandoff(
  context: SetupContext,
  onComplete: () => void,
): void {
  const timeline = context.gsap.timeline({ onComplete });
  animateFaqIndex(context, timeline);
  animateContactHandoff(context, timeline);
}

function reportEntranceFailure(context: SetupContext, error: unknown): void {
  const windowValue = context.root.ownerDocument.defaultView;
  if (windowValue === null) return;
  publishMotionDiagnostic(windowValue, {
    code: "scene-mount-failed",
    sceneId: "faq-safety",
    message: error instanceof Error ? error.message : String(error),
  });
}

function setupHomeService(context: SetupContext): () => void {
  const cleanupReady = markSceneReady(context);
  const owner = new HomeServiceEntranceOwner({
    context,
    onFailure: (error): void => reportEntranceFailure(context, error),
    playFallback: (onComplete): void =>
      createServiceHandoff(context, onComplete),
  });
  context.onCleanup((): void => owner.destroy());
  if (context.capability.kind !== "reduced") {
    playOnceWhenVisible(context, (): void => owner.start());
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
