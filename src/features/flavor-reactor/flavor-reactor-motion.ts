import type { SceneSetup } from "@/motion/create-scene";
import {
  markSceneReady,
  playOnceWhenVisible,
} from "@/motion/scene-setups/shared";

import { animateWorld } from "./flavor-reactor-choreography";
import {
  normalizeWorlds,
  selectedWorld,
  settleOutgoing,
  updateProgress,
} from "./flavor-reactor-presentation";

type ReactorContext = Parameters<SceneSetup>[0];
type SceneTimeline = ReturnType<ReactorContext["gsap"]["timeline"]>;

export const setupFlavorReactor: SceneSetup = (context): (() => void) => {
  let timeline: SceneTimeline | null = null;
  let activeWorld: HTMLElement | null = null;
  let leavingWorld: HTMLElement | null = null;
  let cancelFrame: (() => void) | null = null;
  let intent = 0;
  const cleanupReady = markSceneReady(context);

  const renderSelection = (): void => {
    const activeIntent = ++intent;
    settleOutgoing(leavingWorld);
    leavingWorld = null;
    const queuedWorld = selectedWorld(context);
    if (activeWorld !== null && activeWorld !== queuedWorld) {
      activeWorld.setAttribute("data-reactor-leaving", "");
      leavingWorld = activeWorld;
    }
    cancelFrame?.();
    cancelFrame = context.requestFrame((): void => {
      cancelFrame = null;
      if (activeIntent !== intent) return;
      const world = selectedWorld(context);
      if (world === null) return;

      updateProgress(context, world);
      timeline?.kill();
      settleOutgoing(leavingWorld);
      const outgoing = activeWorld === world ? null : activeWorld;
      activeWorld = world;
      if (context.capability.kind === "reduced") {
        normalizeWorlds(context);
        timeline = null;
        return;
      }

      leavingWorld = outgoing;
      timeline = animateWorld({
        context,
        incoming: world,
        onComplete: (): void => {
          if (activeIntent !== intent) return;
          settleOutgoing(outgoing);
          leavingWorld = null;
          timeline = null;
        },
        outgoing,
      });
    });
  };

  playOnceWhenVisible(context, renderSelection);
  context.listen(context.root, "gorilla:selection-change", renderSelection);
  context.onCleanup((): void => {
    intent += 1;
    cancelFrame?.();
    timeline?.kill();
    settleOutgoing(leavingWorld);
    cancelFrame = null;
    leavingWorld = null;
    activeWorld = null;
    timeline = null;
  });

  return cleanupReady;
};
