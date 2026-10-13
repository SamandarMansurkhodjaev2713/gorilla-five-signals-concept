import type { SceneSetup, SceneSetupContext } from "../create-scene";
import { MOTION_EASE } from "../tokens";
import { markSceneReady, playOnceWhenVisible } from "./shared";
import {
  getProductWorldMotion,
  type ProductWorldMotionSpec,
} from "./product-world-spec";
import { resetProductWorldPresentation } from "./product-world-presentation";

const FIELD_SELECTOR = "[data-world-art]";
const HERO_SELECTOR = "[data-world-hero]";
const MEDIA_SELECTOR = "[data-world-can-media]";
const HERO_SCRUB_SECONDS = 0.32;
const ENTRY_SIGNAL_SECONDS = 0.2;
const ENTRY_SETTLE_SECONDS = 0.38;
type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;
type TweenVars = Parameters<SceneSetupContext["gsap"]["to"]>[1];

function requireWorldSpec(context: SceneSetupContext): ProductWorldMotionSpec {
  const slug = context.root.dataset.productWorld ?? "";
  const spec = getProductWorldMotion(slug);
  if (spec === undefined) {
    throw new Error(`Missing product-world motion specification for ${slug}.`);
  }
  return spec;
}

function requireHero(context: SceneSetupContext): HTMLElement {
  const hero = context.query<HTMLElement>(HERO_SELECTOR);
  if (hero === null) {
    throw new Error(`Missing product-world hero hook: ${HERO_SELECTOR}.`);
  }
  return hero;
}

function addActivation(
  context: SceneSetupContext,
  timeline: SceneTimeline,
  selector: string,
  signal: TweenVars,
): void {
  const target = context.query<HTMLElement>(selector);
  if (target === null) {
    throw new Error(`Missing product-world motion hook: ${selector}.`);
  }
  timeline
    .to(
      target,
      {
        ...signal,
        duration: ENTRY_SIGNAL_SECONDS,
        ease: MOTION_EASE.snap,
        force3D: true,
      },
      0,
    )
    .to(
      target,
      {
        duration: ENTRY_SETTLE_SECONDS,
        ease: MOTION_EASE.settle,
        rotate: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0,
      },
      ENTRY_SIGNAL_SECONDS,
    );
}

function animateHero(
  context: SceneSetupContext,
  spec: ProductWorldMotionSpec,
): void {
  const entry = context.capability.kind === "full" ? spec.full : spec.lite;
  const timeline = context.gsap.timeline();
  addActivation(context, timeline, FIELD_SELECTOR, entry.field);
  addActivation(context, timeline, MEDIA_SELECTOR, entry.media);
  timeline.call((): void => {
    context.root.dataset.worldEntranceReady = "animated";
  });
}

function scrubTo(
  context: SceneSetupContext,
  timeline: SceneTimeline,
  selector: string,
  vars: TweenVars,
): void {
  const target = context.query<HTMLElement>(selector);
  if (target !== null) {
    timeline.to(target, { ...vars, ease: "none", force3D: true }, 0);
  }
}

function createHeroScrub(
  context: SceneSetupContext,
  hero: HTMLElement,
  spec: ProductWorldMotionSpec,
): void {
  if (context.capability.kind !== "full") {
    return;
  }
  const timeline = context.gsap.timeline({
    scrollTrigger: {
      end: "bottom top",
      invalidateOnRefresh: true,
      scrub: HERO_SCRUB_SECONDS,
      start: "top top",
      trigger: hero,
    },
  });
  scrubTo(context, timeline, FIELD_SELECTOR, spec.scroll.field);
  scrubTo(context, timeline, MEDIA_SELECTOR, spec.scroll.media);
}

export const setupProductDetailWorld: SceneSetup = (context): (() => void) => {
  resetProductWorldPresentation(context.root);
  const spec = requireWorldSpec(context);
  const hero = requireHero(context);
  const cleanupReady = markSceneReady(context);
  const motionPath = spec.id;

  if (context.capability.kind === "reduced") {
    context.root.dataset.worldEntranceReady = "static";
  } else {
    context.root.dataset.motionPath = motionPath;
    playOnceWhenVisible(
      context,
      (): void => {
        animateHero(context, spec);
        createHeroScrub(context, hero, spec);
      },
      hero,
    );
  }

  return (): void => {
    if (context.root.dataset.motionPath === motionPath) {
      delete context.root.dataset.motionPath;
      delete context.root.dataset.worldEntranceReady;
    }
    cleanupReady();
  };
};
