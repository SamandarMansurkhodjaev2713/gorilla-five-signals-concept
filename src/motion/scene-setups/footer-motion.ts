import { publishMotionDiagnostic } from "../diagnostics";
import { FooterEntranceOwner } from "./footer-entrance-owner";
import {
  createSignalSequence,
  markSceneReady,
  playOnceWhenVisible,
} from "./shared";

import type { SceneSetup, SceneSetupContext } from "../create-scene";

function playFallback(
  context: SceneSetupContext,
  onComplete: () => void,
): void {
  const timeline = createSignalSequence(context);
  if (timeline === null) return onComplete();
  timeline.eventCallback("onComplete", onComplete);
}

function reportFailure(context: SceneSetupContext, error: unknown): void {
  const windowValue = context.root.ownerDocument.defaultView;
  if (windowValue === null) return;
  publishMotionDiagnostic(windowValue, {
    code: "scene-mount-failed",
    sceneId: "footer",
    message: error instanceof Error ? error.message : String(error),
  });
}

export const setupFooterScene: SceneSetup = (context): (() => void) => {
  const cleanupReady = markSceneReady(context);
  const owner = new FooterEntranceOwner({
    context,
    onFailure: (error): void => reportFailure(context, error),
    playFallback: (onComplete): void => playFallback(context, onComplete),
  });
  context.onCleanup((): void => owner.destroy());
  if (context.capability.kind !== "reduced")
    playOnceWhenVisible(context, (): void => owner.start());
  return cleanupReady;
};
