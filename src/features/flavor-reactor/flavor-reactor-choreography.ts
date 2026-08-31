import type { SceneSetupContext } from "@/motion/create-scene";
import { MOTION_DURATION_SECONDS, MOTION_EASE } from "@/motion/tokens";

import { animateFullArrival } from "./flavor-reactor-full-motion";
import {
  FLAVOR_DEPARTURE_SPEC,
  FLAVOR_LITE_SPEC,
  FLAVOR_TIMELINE_POSITION,
} from "./flavor-reactor-motion-spec";
import {
  prepareWorlds,
  REACTOR_MOTION_SELECTOR,
  requireWorldElement,
  trajectoryFor,
} from "./flavor-reactor-presentation";
import type { ReactorContext } from "./flavor-reactor-presentation";

type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;

function animateProductDeparture(
  timeline: SceneTimeline,
  world: HTMLElement,
): void {
  const trajectory = trajectoryFor(world);
  timeline.to(requireWorldElement(world, REACTOR_MOTION_SELECTOR.product), {
    autoAlpha: 0,
    duration: MOTION_DURATION_SECONDS.standard,
    ease: MOTION_EASE.snap,
    rotate:
      trajectory.productRotate * FLAVOR_DEPARTURE_SPEC.productRotationRatio,
    x: trajectory.productX * FLAVOR_DEPARTURE_SPEC.productTravelXRatio,
    y: trajectory.productY * FLAVOR_DEPARTURE_SPEC.productTravelYRatio,
  });
}

function animateCopyDeparture(
  timeline: SceneTimeline,
  world: HTMLElement,
): void {
  const trajectory = trajectoryFor(world);
  timeline.to(
    requireWorldElement(world, REACTOR_MOTION_SELECTOR.copy),
    {
      autoAlpha: 0,
      duration: MOTION_DURATION_SECONDS.quick,
      ease: MOTION_EASE.snap,
      xPercent: trajectory.copyXPercent * FLAVOR_DEPARTURE_SPEC.copyTravelRatio,
    },
    FLAVOR_TIMELINE_POSITION.copy,
  );
}

function animateMaterialDeparture(
  timeline: SceneTimeline,
  world: HTMLElement,
): void {
  timeline.to(
    requireWorldElement(world, REACTOR_MOTION_SELECTOR.material),
    {
      autoAlpha: 0,
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.snap,
      scale: FLAVOR_DEPARTURE_SPEC.materialScale,
    },
    FLAVOR_TIMELINE_POSITION.material,
  );
}

function animateDeparture(
  timeline: SceneTimeline,
  world: HTMLElement,
  tier: ReactorContext["capability"]["kind"],
): void {
  animateProductDeparture(timeline, world);
  animateCopyDeparture(timeline, world);
  if (tier === "full") animateMaterialDeparture(timeline, world);
}

function animateLiteArrival(timeline: SceneTimeline, world: HTMLElement): void {
  const trajectory = trajectoryFor(world);
  timeline.from(requireWorldElement(world, REACTOR_MOTION_SELECTOR.product), {
    autoAlpha: 0,
    duration: MOTION_DURATION_SECONDS.standard,
    ease: MOTION_EASE.enter,
    scale: FLAVOR_LITE_SPEC.productScale,
    y: trajectory.productY * FLAVOR_LITE_SPEC.productTravelRatio,
  });
  timeline.from(
    requireWorldElement(world, REACTOR_MOTION_SELECTOR.copy),
    {
      autoAlpha: 0,
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.enter,
      y: trajectory.copyY * FLAVOR_LITE_SPEC.copyTravelRatio,
    },
    FLAVOR_TIMELINE_POSITION.copy,
  );
}

export function animateWorld(options: {
  readonly context: ReactorContext;
  readonly incoming: HTMLElement;
  readonly onComplete: () => void;
  readonly outgoing: HTMLElement | null;
}): SceneTimeline {
  const { context, incoming, onComplete, outgoing } = options;
  prepareWorlds(context, incoming, outgoing);
  const timeline = context.gsap.timeline({
    defaults: { overwrite: true },
    onComplete,
  });
  if (outgoing !== null) {
    animateDeparture(timeline, outgoing, context.capability.kind);
  }
  if (context.capability.kind === "full") {
    animateFullArrival(timeline, incoming);
  } else {
    animateLiteArrival(timeline, incoming);
  }
  return timeline;
}
