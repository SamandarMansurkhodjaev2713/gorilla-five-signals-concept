import { supportsFiniteAnimationPlayer } from "@/motion/native/finite-animation-player";
import { createReactorNativePlan } from "./reactor-native-plan";
import { ReactorNativePlayer } from "./reactor-native-player";
import { readReactorWorld } from "./reactor-native-read";
import { UnsupportedReactorPresentation } from "./reactor-native-types";

import type { ReactorContext } from "../flavor-reactor-presentation";

function supportsNativePlayer(
  windowValue: Window & typeof globalThis,
): boolean {
  return (
    typeof windowValue.DOMMatrixReadOnly === "function" &&
    supportsFiniteAnimationPlayer(windowValue)
  );
}

/** Unsupported presentation uses the verified GSAP path; unexpected errors propagate. */
export function createNativeReactorPlayer(options: {
  readonly context: ReactorContext;
  readonly incoming: HTMLElement;
  readonly outgoing: HTMLElement | null;
  readonly onComplete: () => void;
  readonly onFailure: (error: unknown) => void;
}): ReactorNativePlayer | null {
  const documentValue = options.context.root.ownerDocument;
  const windowValue = documentValue?.defaultView;
  if (
    windowValue === null ||
    windowValue === undefined ||
    options.context.capability.kind === "reduced" ||
    !supportsNativePlayer(windowValue)
  )
    return null;
  try {
    const incoming = readReactorWorld(options.incoming, windowValue);
    const outgoing =
      options.outgoing === null
        ? null
        : readReactorWorld(options.outgoing, windowValue);
    const cues = createReactorNativePlan({
      incoming,
      outgoing,
      tier: options.context.capability.kind,
    });
    return new ReactorNativePlayer({ ...options, documentValue, cues });
  } catch (error: unknown) {
    if (error instanceof UnsupportedReactorPresentation) return null;
    throw error;
  }
}
