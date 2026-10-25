import type { SceneSetup } from "@/motion/create-scene";
import { publishMotionDiagnostic } from "@/motion/diagnostics";
import {
  markSceneReady,
  playOnceWhenVisible,
} from "@/motion/scene-setups/shared";

import { selectedWorld, updateProgress } from "./flavor-reactor-presentation";
import { ReactorTransition } from "./flavor-reactor-transition";

function reportTransitionFailure(
  context: Parameters<SceneSetup>[0],
  error: unknown,
): void {
  const windowValue = context.root.ownerDocument.defaultView;
  if (windowValue === null) return;
  publishMotionDiagnostic(windowValue, {
    code: "scene-mount-failed",
    sceneId: "flavor-explorer",
    message: error instanceof Error ? error.message : String(error),
  });
}

export const setupFlavorReactor: SceneSetup = (context): (() => void) => {
  let transition: ReactorTransition | null = null;
  let activeWorld: HTMLElement | null = null;
  let cancelFrame: (() => void) | null = null;
  let intent = 0;
  const cleanupReady = markSceneReady(context);

  const queuePresentation = (
    next: ReactorTransition,
    activeIntent: number,
    outgoing: HTMLElement | null,
  ): void => {
    // Let selection mutations paint before GSAP resolves computed styles.
    cancelFrame = context.requestFrame((): void => {
      if (activeIntent !== intent) return;
      if (outgoing === null) {
        cancelFrame = null;
        next.play();
        return;
      }
      cancelFrame = context.requestFrame((): void => {
        if (activeIntent !== intent) return;
        cancelFrame = null;
        next.play();
      });
    });
  };

  const renderSelection = (): void => {
    const activeIntent = ++intent;
    cancelFrame?.();
    cancelFrame = null;
    transition?.destroy();
    transition = null;
    const incoming = selectedWorld(context);
    if (incoming === null) {
      activeWorld = null;
      return;
    }
    const outgoing = activeWorld === incoming ? null : activeWorld;
    activeWorld = incoming;
    updateProgress(context, incoming);
    if (context.capability.kind === "reduced") return;
    const next = new ReactorTransition({
      context,
      incoming,
      outgoing,
      onComplete: (): void => {
        if (activeIntent === intent) transition = null;
      },
      onFailure: (error): void => reportTransitionFailure(context, error),
    });
    transition = next;
    queuePresentation(next, activeIntent, outgoing);
  };

  playOnceWhenVisible(context, renderSelection);
  context.listen(context.root, "gorilla:selection-change", renderSelection);
  context.onCleanup((): void => {
    intent += 1;
    cancelFrame?.();
    transition?.destroy();
    cancelFrame = null;
    activeWorld = null;
    transition = null;
  });

  return cleanupReady;
};
