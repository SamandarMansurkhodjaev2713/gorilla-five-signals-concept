import type { SceneSetup, SceneSetupContext } from "../create-scene";
import {
  MOTION_DISTANCE_PX,
  MOTION_DURATION_SECONDS,
  MOTION_EASE,
  MOTION_STAGGER_SECONDS,
} from "../tokens";
import { markSceneReady, playOnceWhenVisible } from "./shared";
import {
  getProductWorldMotion,
  type ProductWorldMotionSpec,
} from "./product-world-spec";

const AURA_SELECTOR = "[data-world-can-aura]";
const COPY_SELECTOR = "[data-world-copy]";
const FIELD_SELECTOR = "[data-world-art]";
const HANDOFF_SELECTOR = "[data-world-handoff]";
const HERO_SELECTOR = "[data-world-hero]";
const INFORMATION_SELECTOR = "[data-world-information]";
const MEDIA_SELECTOR = "[data-world-can-media]";
const PARTICLE_SELECTOR = "[data-world-particle]";
const REFLECTION_SELECTOR = "[data-world-reflection]";
const VECTOR_SELECTOR = "[data-world-vector]";
const VOLUME_SELECTOR = "[data-world-volume-layer]";
const HERO_SCRUB_SECONDS = 0.32;
type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;
type TweenVars = Parameters<SceneSetupContext["gsap"]["from"]>[1];

function requireWorldSpec(context: SceneSetupContext): ProductWorldMotionSpec {
  const slug = context.root.dataset.productWorld ?? "";
  const spec = getProductWorldMotion(slug);
  if (spec === undefined) {
    throw new Error(`Missing product-world motion specification for ${slug}.`);
  }
  return spec;
}

function animateFrom(
  context: SceneSetupContext,
  timeline: SceneTimeline,
  selector: string,
  vars: TweenVars,
  position: number | string,
): void {
  const targets = context.queryAll<HTMLElement>(selector);
  if (targets.length === 0) {
    return;
  }
  timeline.from(
    targets,
    {
      ...vars,
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
      force3D: true,
      stagger: MOTION_STAGGER_SECONDS.tight,
    },
    position,
  );
}

function animateFullHero(
  context: SceneSetupContext,
  spec: ProductWorldMotionSpec,
): void {
  const timeline = context.gsap.timeline();
  animateFrom(context, timeline, VOLUME_SELECTOR, spec.volume, 0);
  animateFrom(context, timeline, FIELD_SELECTOR, spec.field, 0.03);
  animateFrom(context, timeline, VECTOR_SELECTOR, spec.vectors, 0.06);
  animateFrom(context, timeline, PARTICLE_SELECTOR, spec.particles, 0.08);
  animateFrom(context, timeline, AURA_SELECTOR, spec.aura, 0.08);
  animateFrom(context, timeline, MEDIA_SELECTOR, spec.media, 0.1);
  animateFrom(context, timeline, REFLECTION_SELECTOR, spec.reflection, 0.14);
  animateFrom(context, timeline, COPY_SELECTOR, spec.copy, 0.16);
  timeline.call((): void => {
    context.root.dataset.worldEntranceReady = "animated";
  });
}

function animateLiteHero(context: SceneSetupContext): void {
  const targets = context.queryAll<HTMLElement>(
    `${COPY_SELECTOR}, ${MEDIA_SELECTOR}`,
  );
  if (targets.length === 0) {
    return;
  }
  context.gsap.from(targets, {
    autoAlpha: 0,
    duration: MOTION_DURATION_SECONDS.standard,
    ease: MOTION_EASE.enter,
    stagger: MOTION_STAGGER_SECONDS.standard,
    y: MOTION_DISTANCE_PX.copyReveal,
    onComplete: (): void => {
      context.root.dataset.worldEntranceReady = "animated";
    },
  });
}

function scrubTo(
  context: SceneSetupContext,
  timeline: SceneTimeline,
  selector: string,
  vars: TweenVars,
): void {
  const targets = context.queryAll<HTMLElement>(selector);
  if (targets.length === 0) {
    return;
  }
  timeline.to(targets, { ...vars, ease: "none", force3D: true }, 0);
}

function createHeroScrub(
  context: SceneSetupContext,
  spec: ProductWorldMotionSpec,
): void {
  if (context.capability.kind !== "full") {
    return;
  }
  const hero = context.query<HTMLElement>(HERO_SELECTOR);
  if (hero === null) {
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
  scrubTo(context, timeline, VOLUME_SELECTOR, spec.scroll.volume);
  scrubTo(context, timeline, FIELD_SELECTOR, spec.scroll.field);
  scrubTo(context, timeline, PARTICLE_SELECTOR, spec.scroll.particles);
  scrubTo(context, timeline, AURA_SELECTOR, spec.scroll.aura);
  scrubTo(context, timeline, MEDIA_SELECTOR, spec.scroll.media);
  scrubTo(context, timeline, COPY_SELECTOR, spec.scroll.copy);
}

function observeReveal(
  context: SceneSetupContext,
  selector: string,
  vars: TweenVars,
): void {
  const target = context.query<HTMLElement>(selector);
  if (target === null || context.capability.kind === "reduced") {
    return;
  }
  const observer = new IntersectionObserver(
    (entries): void => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return;
      }
      observer.disconnect();
      context.runOwned((): void => {
        context.gsap.from(target.children, {
          ...vars,
          autoAlpha: 0,
          duration: MOTION_DURATION_SECONDS.scene,
          ease: MOTION_EASE.enter,
          stagger: MOTION_STAGGER_SECONDS.standard,
        });
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
  );
  observer.observe(target);
  context.ownObserver(observer);
}

export const setupProductDetailWorld: SceneSetup = (context): (() => void) => {
  const spec = requireWorldSpec(context);
  const cleanupReady = markSceneReady(context);
  context.root.dataset.motionPath = spec.id;

  if (context.capability.kind === "reduced") {
    context.root.dataset.worldEntranceReady = "static";
  }

  playOnceWhenVisible(context, (): void => {
    if (context.capability.kind === "full") {
      animateFullHero(context, spec);
      createHeroScrub(context, spec);
      return;
    }
    if (context.capability.kind === "lite") {
      animateLiteHero(context);
    }
  });
  observeReveal(context, INFORMATION_SELECTOR, spec.information);
  observeReveal(context, HANDOFF_SELECTOR, spec.handoff);

  return (): void => {
    // These attributes describe the current DOM composition. Leaving them in
    // place prevents an older capability cleanup from erasing a newer mount.
    cleanupReady();
  };
};
