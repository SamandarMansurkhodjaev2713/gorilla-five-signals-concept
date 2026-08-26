import type { SceneSetup } from "@/motion/create-scene";
import {
  MOTION_DURATION_SECONDS,
  MOTION_EASE,
  MOTION_STAGGER_SECONDS,
} from "@/motion/tokens";
import {
  markSceneReady,
  playOnceWhenVisible,
} from "@/motion/scene-setups/shared";

import {
  DEFAULT_FLAVOR_TRAJECTORY,
  FLAVOR_DEPARTURE_SPEC,
  FLAVOR_TIMELINE_POSITION,
  FLAVOR_TRAJECTORIES,
} from "./flavor-reactor-motion-spec";
import type { FlavorTrajectory } from "./flavor-reactor-motion-spec";

const SELECTED_SELECTOR = "[data-reactor-world][data-motion-selected]";
const WORLD_SELECTOR = "[data-reactor-world]";
const PRODUCT_SELECTOR = "[data-motion-product]";
const COPY_SELECTOR = "[data-motion-copy]";
const WORD_SELECTOR = "[data-reactor-word]";
const MATERIAL_SELECTOR = "[data-reactor-material]";
const ORBIT_SELECTOR = "[data-reactor-orbit]";
const SHARD_SELECTOR = "[data-reactor-shard]";
const CURRENT_SELECTOR = "[data-reactor-current]";

type ReactorContext = Parameters<SceneSetup>[0];
type SceneTimeline = ReturnType<ReactorContext["gsap"]["timeline"]>;

function selectedWorld(context: ReactorContext): HTMLElement | null {
  return context.query<HTMLElement>(SELECTED_SELECTOR);
}

function trajectoryFor(world: HTMLElement): FlavorTrajectory {
  const slug = world.dataset.flavor ?? "original";
  return FLAVOR_TRAJECTORIES[slug] ?? DEFAULT_FLAVOR_TRAJECTORY;
}

function requireWorldElement(
  world: HTMLElement,
  selector: string,
): HTMLElement {
  const element = world.querySelector<HTMLElement>(selector);
  if (element === null) {
    throw new Error(`Flavor world hook is missing: ${selector}`);
  }
  return element;
}

function updateProgress(context: ReactorContext, world: HTMLElement): void {
  const worlds = context.queryAll<HTMLElement>(WORLD_SELECTOR);
  const index = worlds.indexOf(world);
  const current = context.query<HTMLElement>(CURRENT_SELECTOR);
  if (current !== null && index >= 0) {
    current.textContent = String(index + 1).padStart(2, "0");
  }
}

function normalizeWorlds(context: ReactorContext, active: HTMLElement): void {
  for (const world of context.queryAll<HTMLElement>(WORLD_SELECTOR)) {
    world.removeAttribute("data-reactor-leaving");
    if (world !== active) {
      context.gsap.set(world, { autoAlpha: 0, visibility: "hidden" });
    }
  }
  context.gsap.set(active, { autoAlpha: 1, visibility: "visible" });
}

function prepareWorlds(
  context: ReactorContext,
  active: HTMLElement,
  outgoing: HTMLElement | null,
): void {
  for (const world of context.queryAll<HTMLElement>(WORLD_SELECTOR)) {
    world.removeAttribute("data-reactor-leaving");
    if (world !== active && world !== outgoing) {
      context.gsap.set(world, { autoAlpha: 0, visibility: "hidden" });
    }
  }
  context.gsap.set(active, { autoAlpha: 1, visibility: "visible" });
  if (outgoing !== null) {
    outgoing.setAttribute("data-reactor-leaving", "");
    context.gsap.set(outgoing, { autoAlpha: 1, visibility: "visible" });
  }
}

function animateDeparture(timeline: SceneTimeline, world: HTMLElement): void {
  const trajectory = trajectoryFor(world);
  const product = requireWorldElement(world, PRODUCT_SELECTOR);
  const copy = requireWorldElement(world, COPY_SELECTOR);
  const material = requireWorldElement(world, MATERIAL_SELECTOR);
  timeline
    .to(
      product,
      {
        autoAlpha: 0,
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.snap,
        rotate:
          trajectory.productRotate * FLAVOR_DEPARTURE_SPEC.productRotationRatio,
        x: trajectory.productX * FLAVOR_DEPARTURE_SPEC.productTravelXRatio,
        y: trajectory.productY * FLAVOR_DEPARTURE_SPEC.productTravelYRatio,
      },
      FLAVOR_TIMELINE_POSITION.product,
    )
    .to(
      copy,
      {
        autoAlpha: 0,
        duration: MOTION_DURATION_SECONDS.quick,
        ease: MOTION_EASE.snap,
        xPercent:
          trajectory.copyXPercent * FLAVOR_DEPARTURE_SPEC.copyTravelRatio,
      },
      FLAVOR_TIMELINE_POSITION.copy,
    )
    .to(
      material,
      {
        autoAlpha: 0,
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.snap,
        scale: FLAVOR_DEPARTURE_SPEC.materialScale,
      },
      FLAVOR_TIMELINE_POSITION.material,
    );
}

function animateMaterial(timeline: SceneTimeline, world: HTMLElement): void {
  const trajectory = trajectoryFor(world);
  const material = requireWorldElement(world, MATERIAL_SELECTOR);
  const orbits = world.querySelectorAll<HTMLElement>(ORBIT_SELECTOR);
  const shards = world.querySelectorAll<HTMLElement>(SHARD_SELECTOR);
  timeline.fromTo(
    material,
    { autoAlpha: 0, scale: 0.9 },
    {
      autoAlpha: 1,
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
      scale: 1,
    },
    FLAVOR_TIMELINE_POSITION.material,
  );
  timeline.from(
    orbits,
    {
      duration: MOTION_DURATION_SECONDS.entranceMax,
      ease: MOTION_EASE.material,
      rotate: trajectory.shardRotation,
      scale: 0.62,
      stagger: MOTION_STAGGER_SECONDS.tight,
    },
    FLAVOR_TIMELINE_POSITION.material,
  );
  timeline.from(
    shards,
    {
      autoAlpha: 0,
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.enter,
      rotate: -trajectory.shardRotation,
      scale: 0.42,
      stagger: MOTION_STAGGER_SECONDS.tight,
    },
    FLAVOR_TIMELINE_POSITION.shard,
  );
}

function animateProduct(timeline: SceneTimeline, world: HTMLElement): void {
  const trajectory = trajectoryFor(world);
  const product = requireWorldElement(world, PRODUCT_SELECTOR);
  timeline.fromTo(
    product,
    {
      rotate: trajectory.productRotate,
      scale: trajectory.productScale,
      x: trajectory.productX,
      y: trajectory.productY,
    },
    {
      duration: MOTION_DURATION_SECONDS.entranceMax,
      ease: MOTION_EASE.material,
      force3D: true,
      rotate: 0,
      scale: 1,
      x: 0,
      y: 0,
    },
    FLAVOR_TIMELINE_POSITION.product,
  );
}

function animateCopy(timeline: SceneTimeline, world: HTMLElement): void {
  const trajectory = trajectoryFor(world);
  const copy = requireWorldElement(world, COPY_SELECTOR);
  const word = requireWorldElement(world, WORD_SELECTOR);
  timeline.fromTo(
    copy,
    { autoAlpha: 0, xPercent: trajectory.copyXPercent, y: trajectory.copyY },
    {
      autoAlpha: 1,
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.enter,
      xPercent: 0,
      y: 0,
    },
    FLAVOR_TIMELINE_POSITION.copy,
  );
  timeline.from(
    word,
    {
      clipPath: "inset(0 100% 0 0)",
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.enter,
    },
    FLAVOR_TIMELINE_POSITION.word,
  );
}

function animateWorld(
  context: ReactorContext,
  world: HTMLElement,
  outgoing: HTMLElement | null,
  onComplete: () => void,
): SceneTimeline {
  prepareWorlds(context, world, outgoing);
  const timeline = context.gsap.timeline({
    defaults: { overwrite: true },
    onComplete,
  });
  if (outgoing !== null) {
    animateDeparture(timeline, outgoing);
  }
  animateMaterial(timeline, world);
  animateProduct(timeline, world);
  animateCopy(timeline, world);
  return timeline;
}

export const setupFlavorReactor: SceneSetup = (context): (() => void) => {
  let timeline: SceneTimeline | null = null;
  let activeWorld: HTMLElement | null = null;
  let leavingWorld: HTMLElement | null = null;
  let cancelFrame: (() => void) | null = null;
  const cleanupReady = markSceneReady(context);

  const clearLeavingWorld = (): void => {
    if (leavingWorld === null) {
      return;
    }
    leavingWorld.removeAttribute("data-reactor-leaving");
    context.gsap.set(leavingWorld, { autoAlpha: 0, visibility: "hidden" });
    leavingWorld = null;
  };

  const renderSelection = (): void => {
    cancelFrame?.();
    cancelFrame = context.requestFrame((): void => {
      cancelFrame = null;
      const world = selectedWorld(context);
      if (world === null) {
        return;
      }
      updateProgress(context, world);
      timeline?.kill();
      clearLeavingWorld();
      const outgoing = activeWorld === world ? null : activeWorld;
      activeWorld = world;
      if (context.capability.kind === "reduced") {
        normalizeWorlds(context, world);
        timeline = null;
        return;
      }
      leavingWorld = outgoing;
      timeline = animateWorld(context, world, outgoing, clearLeavingWorld);
    });
  };

  playOnceWhenVisible(context, renderSelection);
  context.listen(context.root, "gorilla:selection-change", renderSelection);
  context.onCleanup((): void => {
    cancelFrame?.();
    timeline?.kill();
    clearLeavingWorld();
  });

  return cleanupReady;
};
