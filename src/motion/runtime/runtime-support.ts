import type { MotionCapability } from "../scene-contract";

export const FALLBACK_CAPABILITY: MotionCapability = {
  kind: "reduced",
  reason: "runtime-fallback",
};

export const INITIAL_CAPABILITY: MotionCapability = {
  kind: "reduced",
  reason: "system-preference",
};

export function sameCapability(
  left: MotionCapability,
  right: MotionCapability,
): boolean {
  return left.kind === right.kind && left.reason === right.reason;
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
