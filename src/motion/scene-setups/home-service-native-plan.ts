import { NATIVE_MOTION_EASING } from "../native-easing";
import { HOME_SERVICE_TIMING_SECONDS } from "./home-service-motion-spec";

import type { FiniteAnimationCue } from "../native/finite-animation-player";
import type { HomeServiceTargets } from "./home-service-motion-contract";

const MILLISECONDS_PER_SECOND = 1_000;
const TIMING_PRECISION_FACTOR = 10_000;
const REST_CLIP_PATH = "inset(0 0 0 0)";

export type HomeServiceTier = "full" | "lite";

function milliseconds(seconds: number): number {
  // Match GSAP's seven-decimal second precision at exact reveal boundaries.
  return (
    Math.round(seconds * MILLISECONDS_PER_SECOND * TIMING_PRECISION_FACTOR) /
    TIMING_PRECISION_FACTOR
  );
}

function opacityCue(options: {
  readonly target: HTMLElement;
  readonly role: string;
  readonly delay: number;
  readonly duration: number;
  readonly easing: string;
}): FiniteAnimationCue {
  return {
    target: options.target,
    role: options.role,
    delayMs: milliseconds(options.delay),
    durationMs: milliseconds(options.duration),
    easing: options.easing,
    frames: [{ opacity: 0 }, { opacity: 1 }],
  };
}

function revealCue(options: {
  readonly target: HTMLElement;
  readonly role: string;
  readonly clipPath: string;
  readonly delay: number;
  readonly duration: number;
  readonly easing: string;
}): FiniteAnimationCue {
  return {
    ...opacityCue(options),
    frames: [
      { clipPath: options.clipPath, opacity: 0 },
      { clipPath: REST_CLIP_PATH, opacity: 1 },
    ],
  };
}

function staggeredReveal(options: {
  readonly targets: readonly HTMLElement[];
  readonly role: string;
  readonly clipPath: string;
  readonly delay: number;
  readonly duration: number;
}): readonly FiniteAnimationCue[] {
  return options.targets.map((target, index) =>
    revealCue({
      ...options,
      target,
      delay: options.delay + HOME_SERVICE_TIMING_SECONDS.stagger * index,
      easing: NATIVE_MOTION_EASING.enter,
    }),
  );
}

function fullContactCues(
  targets: HomeServiceTargets,
): readonly FiniteAnimationCue[] {
  const timing = HOME_SERVICE_TIMING_SECONDS;
  return [
    opacityCue({
      target: targets.contactWord,
      role: "contact-word",
      delay: timing.contactWordDelay,
      duration: timing.sceneDuration,
      easing: NATIVE_MOTION_EASING.material,
    }),
    ...staggeredReveal({
      targets: targets.contactCopy,
      role: "contact-copy",
      clipPath: "inset(0 0 100% 0)",
      delay: timing.contactCopyDelay,
      duration: timing.standardDuration,
    }),
  ];
}

function faqCues(targets: HomeServiceTargets): readonly FiniteAnimationCue[] {
  const timing = HOME_SERVICE_TIMING_SECONDS;
  return [
    revealCue({
      target: targets.header,
      role: "header",
      clipPath: "inset(0 0 100% 0)",
      delay: 0,
      duration: timing.sceneDuration,
      easing: NATIVE_MOTION_EASING.enter,
    }),
    ...staggeredReveal({
      targets: targets.rows,
      role: "row",
      clipPath: "inset(0 100% 0 0)",
      delay: timing.rowDelay,
      duration: timing.standardDuration,
    }),
    opacityCue({
      target: targets.action,
      role: "action",
      delay: timing.actionDelay,
      duration: timing.standardDuration,
      easing: NATIVE_MOTION_EASING.enter,
    }),
  ];
}

function contactCues(
  targets: HomeServiceTargets,
  tier: HomeServiceTier,
): readonly FiniteAnimationCue[] {
  const timing = HOME_SERVICE_TIMING_SECONDS;
  return [
    revealCue({
      target: targets.contact,
      role: "contact",
      clipPath: "inset(8% 0 8% 0)",
      delay: timing.contactDelay,
      duration: timing.sceneDuration,
      easing: NATIVE_MOTION_EASING.material,
    }),
    ...(tier === "full" ? fullContactCues(targets) : []),
  ];
}

export function createHomeServicePlan(options: {
  readonly targets: HomeServiceTargets;
  readonly tier: HomeServiceTier;
}): readonly FiniteAnimationCue[] {
  return [
    ...faqCues(options.targets),
    ...contactCues(options.targets, options.tier),
  ];
}
