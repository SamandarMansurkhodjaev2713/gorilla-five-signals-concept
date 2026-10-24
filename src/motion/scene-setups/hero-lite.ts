import type { SceneSetupContext } from "../create-scene";
import { HERO_CAN_COMPACT_ENTRY_SPEC } from "../hero-can-spec";
import {
  MOTION_DISTANCE_PX,
  MOTION_DURATION_SECONDS,
  MOTION_EASE,
} from "../tokens";

const PRIMARY_CAN_SELECTOR = "[data-hero-primary-can]";
const SIGNAL_PLATE_SELECTOR = "[data-motion-hero-band]";
const TITLE_SELECTOR = "[data-motion-hero-title]";
const BAND_START_SECONDS = 0.08;
type HeroTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;

function animateLiteCan(
  context: SceneSetupContext,
  timeline: HeroTimeline,
): void {
  const primaryCan = context.query<HTMLElement>(PRIMARY_CAN_SELECTOR);
  if (primaryCan !== null)
    timeline.from(
      primaryCan,
      {
        duration: MOTION_DURATION_SECONDS.scene,
        rotate: HERO_CAN_COMPACT_ENTRY_SPEC.rotationDegrees,
        scale: HERO_CAN_COMPACT_ENTRY_SPEC.scale,
        y: HERO_CAN_COMPACT_ENTRY_SPEC.travelY,
      },
      0,
    );
}

function animateLiteBand(
  context: SceneSetupContext,
  timeline: HeroTimeline,
): void {
  const signalPlate = context.query<HTMLElement>(SIGNAL_PLATE_SELECTOR);
  if (signalPlate !== null)
    timeline.from(
      signalPlate,
      {
        duration: MOTION_DURATION_SECONDS.standard,
        clipPath: "inset(0 100% 0 0)",
      },
      BAND_START_SECONDS,
    );
}

/** Touch retains a finite signal-lock focal moment without desktop ghosts or pointer work. */
export function animateLiteSignalBoot(context: SceneSetupContext): void {
  const timeline = context.gsap.timeline({
    defaults: { ease: MOTION_EASE.enter },
  });
  timeline.from(
    context.queryAll(TITLE_SELECTOR),
    {
      duration: MOTION_DURATION_SECONDS.standard,
      clipPath: "inset(0 0 100% 0)",
      y: MOTION_DISTANCE_PX.copyReveal,
    },
    0,
  );
  animateLiteCan(context, timeline);
  animateLiteBand(context, timeline);
}
