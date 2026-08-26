import type { MotionCapability } from "../scene-contract";

export const MOTION_RUNTIME_READY_EVENT = "gorilla:motion-runtime-ready";

export type MotionRuntimeState = "destroyed" | "fallback" | "loading" | "ready";

export interface MotionRuntime {
  readonly ready: Promise<void>;
  currentCapability(): MotionCapability;
  destroy(): void;
}

export interface MotionRuntimeOptions {
  readonly documentValue?: Document;
  readonly windowValue?: Window;
}
