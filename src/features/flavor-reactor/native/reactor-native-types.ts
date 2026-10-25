import type { FlavorTrajectory } from "../flavor-reactor-motion-spec";
import type { ReactorEase } from "./reactor-easing";
import type { TransformPose } from "./reactor-transform";

export type ReactorRole =
  "product" | "copy" | "material" | "word" | "orbit" | "shard";

export interface ReactorBaseline {
  readonly element: HTMLElement;
  readonly pose: TransformPose;
  readonly opacity: number;
  readonly visibility: string;
  readonly clipPath: string;
}

export interface ReactorWorldBaseline {
  readonly trajectory: FlavorTrajectory;
  readonly product: ReactorBaseline;
  readonly copy: ReactorBaseline;
  readonly material: ReactorBaseline;
  readonly word: ReactorBaseline;
  readonly orbits: readonly ReactorBaseline[];
  readonly shards: readonly ReactorBaseline[];
}

export interface ReactorNativeCue {
  readonly target: HTMLElement;
  readonly frames: readonly [Keyframe, Keyframe];
  readonly delayMs: number;
  readonly durationMs: number;
  readonly ease: ReactorEase;
  readonly role: ReactorRole;
}

export class UnsupportedReactorPresentation extends Error {}
