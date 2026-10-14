import type { SceneSetupContext } from "@/motion/create-scene";
import {
  MOTION_DURATION_SECONDS,
  MOTION_EASE,
  MOTION_STAGGER_SECONDS,
} from "@/motion/tokens";

import {
  REACTOR_MOTION_SELECTOR,
  requireWorldElement,
  trajectoryFor,
} from "./flavor-reactor-presentation";

type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;

function animateMaterialField(
  timeline: SceneTimeline,
  world: HTMLElement,
): void {
  timeline.fromTo(
    requireWorldElement(world, REACTOR_MOTION_SELECTOR.material),
    { autoAlpha: 0, scale: 0.9 },
    {
      autoAlpha: 1,
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
      scale: 1,
    },
    0,
  );
}

function animateOrbits(timeline: SceneTimeline, world: HTMLElement): void {
  const trajectory = trajectoryFor(world);
  timeline.from(world.querySelectorAll(REACTOR_MOTION_SELECTOR.orbit), {
    duration: MOTION_DURATION_SECONDS.entranceMax,
    ease: MOTION_EASE.material,
    rotate: trajectory.shardRotation,
    scale: 0.62,
    stagger: MOTION_STAGGER_SECONDS.tight,
  });
}

function animateShards(timeline: SceneTimeline, world: HTMLElement): void {
  const trajectory = trajectoryFor(world);
  timeline.from(world.querySelectorAll(REACTOR_MOTION_SELECTOR.shard), {
    autoAlpha: 0,
    duration: MOTION_DURATION_SECONDS.scene,
    ease: MOTION_EASE.enter,
    rotate: -trajectory.shardRotation,
    scale: 0.42,
    stagger: MOTION_STAGGER_SECONDS.tight,
  });
}

function animateProduct(timeline: SceneTimeline, world: HTMLElement): void {
  const trajectory = trajectoryFor(world);
  timeline.fromTo(
    requireWorldElement(world, REACTOR_MOTION_SELECTOR.product),
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
    0,
  );
}

function animateCopy(timeline: SceneTimeline, world: HTMLElement): void {
  const trajectory = trajectoryFor(world);
  timeline.fromTo(
    requireWorldElement(world, REACTOR_MOTION_SELECTOR.copy),
    { autoAlpha: 0, xPercent: trajectory.copyXPercent, y: trajectory.copyY },
    {
      autoAlpha: 1,
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.enter,
      xPercent: 0,
      y: 0,
    },
    0.12,
  );
  timeline.from(
    requireWorldElement(world, REACTOR_MOTION_SELECTOR.word),
    {
      clipPath: "inset(0 100% 0 0)",
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.enter,
    },
    0.16,
  );
}

export function animateFullArrival(
  timeline: SceneTimeline,
  world: HTMLElement,
): void {
  animateMaterialField(timeline, world);
  animateOrbits(timeline, world);
  animateShards(timeline, world);
  animateProduct(timeline, world);
  animateCopy(timeline, world);
}
