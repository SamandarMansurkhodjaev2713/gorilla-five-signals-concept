import {
  MOTION_DURATION_SECONDS,
  MOTION_STAGGER_SECONDS,
} from "@/motion/tokens";
import {
  FLAVOR_DEPARTURE_SPEC,
  FLAVOR_LITE_SPEC,
  FLAVOR_TIMELINE_POSITION,
} from "../flavor-reactor-motion-spec";
import { reactorCue } from "./reactor-native-frames";

import type {
  ReactorNativeCue,
  ReactorWorldBaseline,
} from "./reactor-native-types";

const MS_PER_SECOND = 1000;
const DURATION = Object.freeze({
  quick: MOTION_DURATION_SECONDS.quick * MS_PER_SECOND,
  standard: MOTION_DURATION_SECONDS.standard * MS_PER_SECOND,
  scene: MOTION_DURATION_SECONDS.scene * MS_PER_SECOND,
  entrance: MOTION_DURATION_SECONDS.entranceMax * MS_PER_SECOND,
});
const COPY_DELAY_MS = FLAVOR_TIMELINE_POSITION.copy * MS_PER_SECOND;
const WORD_DELAY_MS = FLAVOR_TIMELINE_POSITION.word * MS_PER_SECOND;
const STAGGER_MS = MOTION_STAGGER_SECONDS.tight * MS_PER_SECOND;
const ORBIT_START_SCALE = 0.62;
const SHARD_START_SCALE = 0.42;
const MATERIAL_START_SCALE = 0.9;

function departure(
  world: ReactorWorldBaseline,
  tier: "full" | "lite",
): readonly ReactorNativeCue[] {
  const { trajectory: t } = world;
  const cues = [
    reactorCue({
      baseline: world.product,
      role: "product",
      from: { pose: {}, opacity: world.product.opacity },
      to: {
        pose: {
          rotationDegrees:
            t.productRotate * FLAVOR_DEPARTURE_SPEC.productRotationRatio,
          x: t.productX * FLAVOR_DEPARTURE_SPEC.productTravelXRatio,
          y: t.productY * FLAVOR_DEPARTURE_SPEC.productTravelYRatio,
        },
        opacity: 0,
      },
      delayMs: 0,
      durationMs: DURATION.standard,
      ease: "snap",
    }),
    reactorCue({
      baseline: world.copy,
      role: "copy",
      from: { pose: {}, opacity: world.copy.opacity },
      to: {
        pose: {
          xPercent: t.copyXPercent * FLAVOR_DEPARTURE_SPEC.copyTravelRatio,
        },
        opacity: 0,
      },
      delayMs: COPY_DELAY_MS,
      durationMs: DURATION.quick,
      ease: "snap",
    }),
  ];
  if (tier === "full")
    cues.push(
      reactorCue({
        baseline: world.material,
        role: "material",
        from: { pose: {}, opacity: world.material.opacity },
        to: {
          pose: {
            scaleX: FLAVOR_DEPARTURE_SPEC.materialScale,
            scaleY: FLAVOR_DEPARTURE_SPEC.materialScale,
          },
          opacity: 0,
        },
        delayMs: 0,
        durationMs: DURATION.standard,
        ease: "snap",
      }),
    );
  return cues;
}

function fullArrival(world: ReactorWorldBaseline): readonly ReactorNativeCue[] {
  const { trajectory: t } = world;
  const orbitStart = DURATION.scene;
  const shardStart =
    orbitStart + DURATION.entrance + (world.orbits.length - 1) * STAGGER_MS;
  return [
    reactorCue({
      baseline: world.material,
      role: "material",
      from: {
        pose: { scaleX: MATERIAL_START_SCALE, scaleY: MATERIAL_START_SCALE },
        opacity: 0,
      },
      to: { pose: { scaleX: 1, scaleY: 1 }, opacity: 1 },
      delayMs: 0,
      durationMs: DURATION.scene,
      ease: "material",
    }),
    ...world.orbits.map((baseline, index) =>
      reactorCue({
        baseline,
        role: "orbit",
        from: {
          pose: {
            rotationDegrees: t.shardRotation,
            scaleX: ORBIT_START_SCALE,
            scaleY: ORBIT_START_SCALE,
          },
        },
        to: { pose: {} },
        delayMs: orbitStart + index * STAGGER_MS,
        durationMs: DURATION.entrance,
        ease: "material",
      }),
    ),
    ...world.shards.map((baseline, index) =>
      reactorCue({
        baseline,
        role: "shard",
        from: {
          pose: {
            rotationDegrees: -t.shardRotation,
            scaleX: SHARD_START_SCALE,
            scaleY: SHARD_START_SCALE,
          },
          opacity: 0,
        },
        to: { pose: {}, opacity: baseline.opacity },
        delayMs: shardStart + index * STAGGER_MS,
        durationMs: DURATION.scene,
        ease: "enter",
      }),
    ),
    reactorCue({
      baseline: world.product,
      role: "product",
      from: {
        pose: {
          rotationDegrees: t.productRotate,
          scaleX: t.productScale,
          scaleY: t.productScale,
          x: t.productX,
          y: t.productY,
        },
      },
      to: { pose: { rotationDegrees: 0, scaleX: 1, scaleY: 1, x: 0, y: 0 } },
      delayMs: 0,
      durationMs: DURATION.entrance,
      ease: "material",
    }),
    reactorCue({
      baseline: world.copy,
      role: "copy",
      from: { pose: { xPercent: t.copyXPercent, y: t.copyY }, opacity: 0 },
      to: { pose: { xPercent: 0, y: 0 }, opacity: 1 },
      delayMs: COPY_DELAY_MS,
      durationMs: DURATION.scene,
      ease: "enter",
    }),
    reactorCue({
      baseline: world.word,
      role: "word",
      from: { clipPath: "inset(0 100% 0 0)" },
      to: {
        clipPath:
          world.word.clipPath === "none"
            ? "inset(0 0% 0 0)"
            : world.word.clipPath,
      },
      delayMs: WORD_DELAY_MS,
      durationMs: DURATION.scene,
      ease: "enter",
    }),
  ];
}

function liteArrival(
  world: ReactorWorldBaseline,
  productStart: number,
): readonly ReactorNativeCue[] {
  const { trajectory: t } = world;
  return [
    reactorCue({
      baseline: world.product,
      role: "product",
      from: {
        pose: {
          scaleX: FLAVOR_LITE_SPEC.productScale,
          scaleY: FLAVOR_LITE_SPEC.productScale,
          y: t.productY * FLAVOR_LITE_SPEC.productTravelRatio,
        },
        opacity: 0,
      },
      to: { pose: {}, opacity: world.product.opacity },
      delayMs: productStart,
      durationMs: DURATION.standard,
      ease: "enter",
    }),
    reactorCue({
      baseline: world.copy,
      role: "copy",
      from: {
        pose: { y: t.copyY * FLAVOR_LITE_SPEC.copyTravelRatio },
        opacity: 0,
      },
      to: { pose: {}, opacity: world.copy.opacity },
      delayMs: COPY_DELAY_MS,
      durationMs: DURATION.standard,
      ease: "enter",
    }),
  ];
}

/** Preserve the actual implicit append positions, not a flattened approximation. */
export function createReactorNativePlan(options: {
  readonly incoming: ReactorWorldBaseline;
  readonly outgoing: ReactorWorldBaseline | null;
  readonly tier: "full" | "lite";
}): readonly ReactorNativeCue[] {
  const outgoing =
    options.outgoing === null ? [] : departure(options.outgoing, options.tier);
  const productStart =
    options.outgoing === null ? 0 : COPY_DELAY_MS + DURATION.quick;
  return [
    ...outgoing,
    ...(options.tier === "full"
      ? fullArrival(options.incoming)
      : liteArrival(options.incoming, productStart)),
  ];
}
