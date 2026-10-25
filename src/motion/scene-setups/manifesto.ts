import type { SceneSetup } from "../create-scene";
import { publishMotionDiagnostic } from "../diagnostics";
import { captureInlineStyles } from "../inline-style-snapshot";
import { FiniteEntranceOwner } from "../native/finite-entrance-owner";
import { MOTION_EASE } from "../tokens";
import {
  MANIFESTO_MOTION_SPEC as SPEC,
  MANIFESTO_PRESENTATION_PROPERTIES,
  MANIFESTO_PRESENTATION_SELECTOR,
  MANIFESTO_SELECTOR,
} from "./manifesto-motion-spec";
import { createNativeManifesto } from "./manifesto-native";
import { markSceneReady, playOnceWhenVisible } from "./shared";

type SetupContext = Parameters<SceneSetup>[0];

function revealManifesto(context: SetupContext, onComplete: () => void): void {
  const lines = context.queryAll<HTMLElement>(MANIFESTO_SELECTOR.lines);
  const signals = context.queryAll<HTMLElement>(MANIFESTO_SELECTOR.signals);
  const handoff = context.query<HTMLElement>(MANIFESTO_SELECTOR.handoff);
  const transmission = context.queryAll<HTMLElement>(
    MANIFESTO_SELECTOR.transmission,
  );
  const supportingCopy = context.query<HTMLElement>(MANIFESTO_SELECTOR.copy);
  const timeline = context.gsap.timeline({ onComplete });

  timeline
    .from(handoff, {
      duration: SPEC.handoffDuration,
      ease: MOTION_EASE.material,
      scaleY: 0,
      transformOrigin: "top center",
    })
    .from(lines, {
      duration: SPEC.lineDuration,
      clipPath: "inset(0 100% 0 0)",
      ease: MOTION_EASE.material,
      stagger: SPEC.lineStagger,
    })
    .from(
      supportingCopy,
      {
        autoAlpha: 0,
        duration: SPEC.supportDuration,
        ease: MOTION_EASE.enter,
        y: SPEC.copyOffsetPx,
      },
      `-=${SPEC.copyOverlap}`,
    )
    .from(
      transmission,
      {
        duration: SPEC.supportDuration,
        ease: MOTION_EASE.material,
        scaleX: 0,
        stagger: SPEC.signalStagger,
        transformOrigin: "left center",
      },
      `-=${SPEC.transmissionOverlap}`,
    )
    .from(
      signals,
      {
        autoAlpha: 0,
        duration: SPEC.supportDuration,
        ease: MOTION_EASE.enter,
        stagger: SPEC.signalStagger,
        y: SPEC.copyOffsetPx,
      },
      `-=${SPEC.signalOverlap}`,
    );
}

function createOwner(context: SetupContext): FiniteEntranceOwner {
  return new FiniteEntranceOwner({
    label: "Manifesto",
    subject: "manifesto",
    capturePresentation: () =>
      captureInlineStyles(
        context.queryAll<HTMLElement>(MANIFESTO_PRESENTATION_SELECTOR),
        MANIFESTO_PRESENTATION_PROPERTIES,
      ),
    createFallbackContext: (setup) => context.gsap.context(setup, context.root),
    createNative: (lifecycle) =>
      createNativeManifesto({ root: context.root, ...lifecycle }),
    playFallback: (onComplete) => revealManifesto(context, onComplete),
    onFailure: (error) => {
      const windowValue = context.root.ownerDocument.defaultView;
      if (windowValue === null) return;
      publishMotionDiagnostic(windowValue, {
        code: "scene-mount-failed",
        sceneId: "range-manifesto",
        message: error instanceof Error ? error.message : String(error),
      });
    },
  });
}

export const setupManifesto: SceneSetup = (context): (() => void) => {
  const cleanupReady = markSceneReady(context);
  if (context.capability.kind === "reduced") {
    return cleanupReady;
  }

  const owner = createOwner(context);
  context.onCleanup((): void => owner.destroy());
  playOnceWhenVisible(context, (): void => owner.start());

  return cleanupReady;
};
