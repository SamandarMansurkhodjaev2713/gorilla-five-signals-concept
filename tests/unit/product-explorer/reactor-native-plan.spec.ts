import { describe, expect, it } from "vitest";

import {
  FLAVOR_DEPARTURE_SPEC,
  FLAVOR_LITE_SPEC,
  FLAVOR_MOTION_SLUGS,
  FLAVOR_TRAJECTORIES,
  type FlavorMotionSlug,
} from "@/features/flavor-reactor/flavor-reactor-motion-spec";
import { createReactorNativePlan } from "@/features/flavor-reactor/native/reactor-native-plan";
import { serializeReactorTransform } from "@/features/flavor-reactor/native/reactor-transform";

import type {
  ReactorBaseline,
  ReactorNativeCue,
  ReactorRole,
  ReactorWorldBaseline,
} from "@/features/flavor-reactor/native/reactor-native-types";
import type { TransformPose } from "@/features/flavor-reactor/native/reactor-transform";

const BASELINE_OPACITY = 0.73;
const IDENTITY_POSE: TransformPose = {
  rotationDegrees: 0,
  scaleX: 1,
  scaleY: 1,
  skewXDegrees: 0,
  x: 0,
  xPercent: 0,
  y: 0,
  yPercent: 0,
};
const FULL_ROLES: readonly ReactorRole[] = [
  "product",
  "copy",
  "material",
  "material",
  "orbit",
  "orbit",
  "shard",
  "shard",
  "shard",
  "product",
  "copy",
  "word",
];
const FULL_DELAYS = [0, 120, 0, 0, 640, 672, 1552, 1584, 1616, 0, 120, 160];
const FULL_DURATIONS = [
  260, 160, 260, 640, 880, 880, 640, 640, 640, 880, 640, 640,
];
const LITE_ROLES: readonly ReactorRole[] = [
  "product",
  "copy",
  "product",
  "copy",
];
const LITE_DELAYS = [0, 120, 280, 120];
const LITE_DURATIONS = [260, 160, 260, 260];

function fakeElement(): HTMLElement {
  // TYPE-EXCEPTION: Pure cue planning uses HTMLElement only as an opaque target
  // identity; this focused unit must not construct or read a DOM implementation.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return Object.freeze({}) as HTMLElement;
}

function baseline(
  options: {
    readonly clipPath?: string;
    readonly opacity?: number;
    readonly pose?: TransformPose;
  } = {},
): ReactorBaseline {
  return {
    clipPath: options.clipPath ?? "none",
    element: fakeElement(),
    opacity: options.opacity ?? BASELINE_OPACITY,
    pose: options.pose ?? IDENTITY_POSE,
    visibility: "visible",
  };
}

function world(
  slug: FlavorMotionSlug,
  options: { readonly wordClipPath?: string } = {},
): ReactorWorldBaseline {
  return {
    trajectory: FLAVOR_TRAJECTORIES[slug],
    product: baseline(),
    copy: baseline(),
    material: baseline(),
    word:
      options.wordClipPath === undefined
        ? baseline()
        : baseline({ clipPath: options.wordClipPath }),
    orbits: [baseline(), baseline()],
    shards: [baseline(), baseline(), baseline()],
  };
}

function cueFor(
  cues: readonly ReactorNativeCue[],
  target: HTMLElement,
): ReactorNativeCue {
  const cue = cues.find((candidate) => candidate.target === target);
  if (cue === undefined) throw new Error("Expected native Reactor cue target.");
  return cue;
}

function expectSchedule(
  cues: readonly ReactorNativeCue[],
  roles: readonly ReactorRole[],
  delays: readonly number[],
  durations: readonly number[],
): void {
  expect(cues.map(({ role }) => role)).toEqual(roles);
  expect(cues.map(({ delayMs }) => delayMs)).toEqual(delays);
  expect(cues.map(({ durationMs }) => durationMs)).toEqual(durations);
}

function expectAutoAlpha(
  cue: ReactorNativeCue,
  fromOpacity: number,
  toOpacity: number,
): void {
  expect(cue.frames[0]).toMatchObject({
    opacity: fromOpacity,
    visibility: fromOpacity === 0 ? "hidden" : "visible",
  });
  expect(cue.frames[1]).toMatchObject({
    opacity: toOpacity,
    visibility: toOpacity === 0 ? "hidden" : "visible",
  });
}

describe("native Reactor cue plan", () => {
  it.each(FLAVOR_MOTION_SLUGS)(
    "GIVEN %s Full worlds WHEN cues are planned THEN all 12 effects keep the authored roles, offsets, durations and trajectory",
    (slug) => {
      const incoming = world(slug);
      const outgoing = world(slug);
      const cues = createReactorNativePlan({
        incoming,
        outgoing,
        tier: "full",
      });

      expectSchedule(cues, FULL_ROLES, FULL_DELAYS, FULL_DURATIONS);
      expect(cues.map(({ ease }) => ease)).toEqual([
        "snap",
        "snap",
        "snap",
        "material",
        "material",
        "material",
        "enter",
        "enter",
        "enter",
        "material",
        "enter",
        "enter",
      ]);
      const trajectory = FLAVOR_TRAJECTORIES[slug];
      expect(cueFor(cues, incoming.product.element).frames[0].transform).toBe(
        serializeReactorTransform({
          ...IDENTITY_POSE,
          rotationDegrees: trajectory.productRotate,
          scaleX: trajectory.productScale,
          scaleY: trajectory.productScale,
          x: trajectory.productX,
          y: trajectory.productY,
        }),
      );
      expect(cueFor(cues, outgoing.product.element).frames[1].transform).toBe(
        serializeReactorTransform({
          ...IDENTITY_POSE,
          rotationDegrees:
            trajectory.productRotate *
            FLAVOR_DEPARTURE_SPEC.productRotationRatio,
          x: trajectory.productX * FLAVOR_DEPARTURE_SPEC.productTravelXRatio,
          y: trajectory.productY * FLAVOR_DEPARTURE_SPEC.productTravelYRatio,
        }),
      );
    },
  );

  it.each(FLAVOR_MOTION_SLUGS)(
    "GIVEN %s Lite worlds WHEN cues are planned THEN outgoing and incoming preserve the four-effect schedule",
    (slug) => {
      const incoming = world(slug);
      const outgoing = world(slug);
      const cues = createReactorNativePlan({
        incoming,
        outgoing,
        tier: "lite",
      });

      expectSchedule(cues, LITE_ROLES, LITE_DELAYS, LITE_DURATIONS);
      expect(cues.map(({ ease }) => ease)).toEqual([
        "snap",
        "snap",
        "enter",
        "enter",
      ]);
      expect(cueFor(cues, incoming.product.element).frames[0].transform).toBe(
        serializeReactorTransform({
          ...IDENTITY_POSE,
          scaleX: FLAVOR_LITE_SPEC.productScale,
          scaleY: FLAVOR_LITE_SPEC.productScale,
          y:
            FLAVOR_TRAJECTORIES[slug].productY *
            FLAVOR_LITE_SPEC.productTravelRatio,
        }),
      );
    },
  );

  it("GIVEN no outgoing world WHEN Full or Lite cues are planned THEN only the nine or two arrival effects remain at their exact offsets", () => {
    const incoming = world("original");
    const full = createReactorNativePlan({
      incoming,
      outgoing: null,
      tier: "full",
    });
    const lite = createReactorNativePlan({
      incoming,
      outgoing: null,
      tier: "lite",
    });

    expectSchedule(
      full,
      FULL_ROLES.slice(3),
      FULL_DELAYS.slice(3),
      FULL_DURATIONS.slice(3),
    );
    expectSchedule(lite, ["product", "copy"], [0, 120], [260, 260]);
  });

  it("GIVEN non-identity authored CSS WHEN a cue overrides only rotation and scale THEN translation, percent and skew baselines survive", () => {
    const rest: TransformPose = {
      rotationDegrees: 17,
      scaleX: 0.82,
      scaleY: 0.74,
      skewXDegrees: -12,
      x: 31,
      xPercent: -50,
      y: -9,
      yPercent: 0,
    };
    const incoming = world("mango-coconut");
    const orbit = baseline({ pose: rest });
    const secondOrbit = incoming.orbits.at(1);
    if (secondOrbit === undefined) throw new Error("Expected second orbit.");
    const withAuthoredOrbit = {
      ...incoming,
      orbits: [orbit, secondOrbit],
    };
    const cues = createReactorNativePlan({
      incoming: withAuthoredOrbit,
      outgoing: null,
      tier: "full",
    });
    const cue = cueFor(cues, orbit.element);

    expect(cue.frames[0].transform).toBe(
      serializeReactorTransform({
        ...rest,
        rotationDegrees: FLAVOR_TRAJECTORIES["mango-coconut"].shardRotation,
        scaleX: 0.62,
        scaleY: 0.62,
      }),
    );
    expect(cue.frames[1].transform).toBe(serializeReactorTransform(rest));
  });

  it("GIVEN autoAlpha cues WHEN departure and arrival frames are built THEN zero endpoints are hidden and nonzero endpoints are visible", () => {
    const incoming = world("extra");
    const outgoing = world("extra");
    const full = createReactorNativePlan({ incoming, outgoing, tier: "full" });
    const lite = createReactorNativePlan({ incoming, outgoing, tier: "lite" });

    for (const target of [
      outgoing.product.element,
      outgoing.copy.element,
      outgoing.material.element,
    ])
      expectAutoAlpha(cueFor(full, target), BASELINE_OPACITY, 0);
    expectAutoAlpha(cueFor(full, incoming.material.element), 0, 1);
    expectAutoAlpha(cueFor(full, incoming.copy.element), 0, 1);
    for (const shard of incoming.shards)
      expectAutoAlpha(cueFor(full, shard.element), 0, BASELINE_OPACITY);
    expectAutoAlpha(
      cueFor(lite, incoming.product.element),
      0,
      BASELINE_OPACITY,
    );
    expectAutoAlpha(cueFor(lite, incoming.copy.element), 0, BASELINE_OPACITY);
  });

  it("GIVEN a word with computed clip-path none WHEN Full cues are built THEN the reveal ends at an interpolable zero inset", () => {
    const incoming = world("zero", { wordClipPath: "none" });
    const cues = createReactorNativePlan({
      incoming,
      outgoing: null,
      tier: "full",
    });
    const word = cueFor(cues, incoming.word.element);

    expect(word.frames).toEqual([
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)" },
    ]);
  });
});
