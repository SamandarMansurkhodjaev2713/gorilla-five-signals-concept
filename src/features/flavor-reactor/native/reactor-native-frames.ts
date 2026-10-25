import { serializeReactorTransform } from "./reactor-transform";

import type {
  ReactorBaseline,
  ReactorNativeCue,
  ReactorRole,
} from "./reactor-native-types";
import type { ReactorEase } from "./reactor-easing";
import type { TransformPose } from "./reactor-transform";

interface FrameSpec {
  readonly pose?: Partial<TransformPose>;
  readonly opacity?: number;
  readonly clipPath?: string;
}

function frame(baseline: ReactorBaseline, spec: FrameSpec): Keyframe {
  return {
    ...(spec.pose === undefined
      ? {}
      : {
          transform: serializeReactorTransform({
            ...baseline.pose,
            ...spec.pose,
          }),
        }),
    ...(spec.opacity === undefined
      ? {}
      : {
          opacity: spec.opacity,
          visibility: spec.opacity === 0 ? "hidden" : "visible",
        }),
    ...(spec.clipPath === undefined ? {} : { clipPath: spec.clipPath }),
  };
}

/** Build explicit end values; never ask the player to read styles after writes. */
export function reactorCue(options: {
  readonly baseline: ReactorBaseline;
  readonly role: ReactorRole;
  readonly from: FrameSpec;
  readonly to: FrameSpec;
  readonly delayMs: number;
  readonly durationMs: number;
  readonly ease: ReactorEase;
}): ReactorNativeCue {
  return {
    target: options.baseline.element,
    role: options.role,
    frames: [
      frame(options.baseline, options.from),
      frame(options.baseline, options.to),
    ],
    delayMs: options.delayMs,
    durationMs: options.durationMs,
    ease: options.ease,
  };
}
