import type { SceneSetup, SceneSetupContext } from "../create-scene";
import {
  MOTION_DISTANCE_PX,
  MOTION_DURATION_SECONDS,
  MOTION_EASE,
} from "../tokens";
import { requireMotionHook, setupDeferredScene } from "./shared";

const MARKER_ENTRY_ROTATION_DEGREES = 34;
const MARKER_ENTRY_SCALE = 0.72;
const PANEL_ENTRY_SCALE = 0.82;
const SCROLL_SCRUB_SECONDS = 0.32;

function scrollNarrative(context: SceneSetupContext) {
  return {
    end: "bottom top",
    scrub: SCROLL_SCRUB_SECONDS,
    start: "top bottom",
    trigger: context.root,
  } as const;
}

function createCultureScrub(context: SceneSetupContext): void {
  if (context.capability.kind !== "full") {
    return;
  }
  const route = context.query<HTMLElement>(".tashkent-terminal__route");
  const word = context.query<HTMLElement>(".tashkent-terminal__word");
  const coordinates = context.queryAll<HTMLElement>(
    ".tashkent-terminal__coordinate",
  );
  context.gsap
    .timeline({ scrollTrigger: scrollNarrative(context) })
    .fromTo(route, { scaleX: 0.08 }, { ease: "none", scaleX: 1 }, 0)
    .fromTo(word, { xPercent: -9 }, { ease: "none", xPercent: 9 }, 0)
    .fromTo(
      coordinates,
      { yPercent: (index: number) => (index === 0 ? 38 : -38) },
      { ease: "none", yPercent: (index: number) => (index === 0 ? -18 : 18) },
      0,
    );
}

function createLocatorScrub(context: SceneSetupContext): void {
  if (context.capability.kind !== "full") {
    return;
  }
  const marker = context.query<HTMLElement>(".tashkent-terminal__marker");
  const heading = context.query<HTMLElement>(":scope > strong");
  context.gsap
    .timeline({ scrollTrigger: scrollNarrative(context) })
    .fromTo(
      marker,
      { xPercent: -70, yPercent: 55 },
      { ease: "none", xPercent: 55, yPercent: -35 },
      0,
    )
    .fromTo(heading, { xPercent: 7 }, { ease: "none", xPercent: -3 }, 0);
}

function createContactScrub(context: SceneSetupContext): void {
  if (context.capability.kind !== "full") {
    return;
  }
  const echo = context.query<HTMLElement>(".home-service-dock__contact-word");
  const signature = context.query<HTMLElement>(":scope > i");
  context.gsap
    .timeline({ scrollTrigger: scrollNarrative(context) })
    .fromTo(echo, { yPercent: -12 }, { ease: "none", yPercent: 16 }, 0)
    .fromTo(signature, { xPercent: 18 }, { ease: "none", xPercent: -8 }, 0);
}

function animateHomeCulture(context: SceneSetupContext): void {
  const poster = requireMotionHook(
    context,
    "[data-motion-home-culture-poster]",
  );
  const heading = requireMotionHook(
    context,
    "[data-motion-home-culture-heading]",
  );
  if (context.capability.kind === "reduced") {
    return;
  }
  context.gsap
    .timeline()
    .from(poster, {
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
      rotate: 0,
      scaleX: PANEL_ENTRY_SCALE,
      transformOrigin: "right center",
    })
    .from(
      heading,
      {
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.enter,
        x: -MOTION_DISTANCE_PX.copyReveal,
      },
      0,
    );
  createCultureScrub(context);
}

function animateHomeLocator(context: SceneSetupContext): void {
  const field = requireMotionHook(context, "[data-motion-home-locator-field]");
  const marker = requireMotionHook(
    context,
    "[data-motion-home-locator-marker]",
  );
  if (context.capability.kind === "reduced") {
    return;
  }
  context.gsap
    .timeline()
    .from(field, {
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
      scaleX: PANEL_ENTRY_SCALE,
      transformOrigin: "right center",
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
  createLocatorScrub(context);
}

function animateHomeContact(context: SceneSetupContext): void {
  const word = requireMotionHook(context, "[data-motion-home-contact-word]");
  const signal = requireMotionHook(
    context,
    "[data-motion-home-contact-signal]",
  );
  if (context.capability.kind === "reduced") {
    return;
  }
  context.gsap
    .timeline()
    .from(word, {
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
      x: -MOTION_DISTANCE_PX.sceneReveal,
    })
    .from(
      signal,
      {
        duration: MOTION_DURATION_SECONDS.scene,
        ease: MOTION_EASE.material,
        rotate: 0,
        scaleX: PANEL_ENTRY_SCALE,
        transformOrigin: "right center",
      },
      0,
    );
  createContactScrub(context);
}

export const setupCultureScene: SceneSetup = (context) =>
  setupDeferredScene(context, animateHomeCulture);

export const setupLocatorScene: SceneSetup = (context) =>
  setupDeferredScene(context, animateHomeLocator);

export const setupContactScene: SceneSetup = (context) =>
  setupDeferredScene(context, animateHomeContact);
