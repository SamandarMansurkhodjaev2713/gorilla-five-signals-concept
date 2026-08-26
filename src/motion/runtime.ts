import { MotionRuntimeCoordinator } from "./runtime/runtime-coordinator";
import type {
  MotionRuntime,
  MotionRuntimeOptions,
} from "./runtime/runtime-contract";

export type {
  MotionRuntime,
  MotionRuntimeOptions,
} from "./runtime/runtime-contract";

export function createMotionRuntime(
  options: MotionRuntimeOptions = {},
): MotionRuntime {
  return new MotionRuntimeCoordinator(options);
}
