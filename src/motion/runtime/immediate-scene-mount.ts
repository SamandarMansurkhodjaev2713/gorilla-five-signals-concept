import { createOwnedScene } from "../create-scene";
import { SCENE_DEFINITIONS } from "../scene-contract";
import { SCENE_SETUPS } from "../scene-setups";

import type { MotionEngine } from "../motion-engine";
import type {
  MotionCapability,
  SceneDefinition,
  SceneHandle,
} from "../scene-contract";
import type { SceneRegistry } from "../scene-registry";

/** Register the handle before awaiting activation so supersession can destroy it. */
export function mountScene(options: {
  readonly root: HTMLElement;
  readonly definition: SceneDefinition;
  readonly capability: MotionCapability;
  readonly engine: MotionEngine;
  readonly registry: SceneRegistry;
}): SceneHandle {
  const handle = createOwnedScene({
    ...options,
    id: options.definition.id,
    setup: SCENE_SETUPS[options.definition.id],
  });
  options.registry.mount(handle);
  return handle;
}

function waitForAnimationFrame(
  windowValue: Window,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let frameId: number | null = null;
    const finish = (): void => {
      signal.removeEventListener("abort", finish);
      if (frameId !== null) windowValue.cancelAnimationFrame(frameId);
      resolve();
    };
    signal.addEventListener("abort", finish, { once: true });
    if (signal.aborted) return finish();
    try {
      frameId = windowValue.requestAnimationFrame(finish);
    } catch (cause: unknown) {
      signal.removeEventListener("abort", finish);
      reject(
        new Error("Motion initialization could not request a frame.", {
          cause,
        }),
      );
    }
  });
}

/** Install immediate scenes completely before declaring the environment ready. */
export async function mountImmediateScenes(options: {
  readonly documentValue: Document;
  readonly capability: MotionCapability;
  readonly engine: MotionEngine;
  readonly registry: SceneRegistry;
  readonly signal: AbortSignal;
  readonly deferred: Map<Element, SceneDefinition>;
  readonly report: (sceneId: string | undefined, error: unknown) => void;
}): Promise<void> {
  const windowValue = options.documentValue.defaultView;
  if (windowValue === null)
    throw new Error("The motion document has no owning window.");
  for (const definition of SCENE_DEFINITIONS) {
    const roots = options.documentValue.querySelectorAll<HTMLElement>(
      definition.selector,
    );
    for (const root of roots) {
      if (options.signal.aborted) return;
      if (definition.mountOnceVisible) {
        options.deferred.set(root, definition);
        continue;
      }
      try {
        await waitForAnimationFrame(windowValue, options.signal);
        if (options.signal.aborted) return;
        await mountScene({ ...options, root, definition }).ready;
      } catch (error: unknown) {
        options.report(definition.id, error);
        throw error;
      }
    }
  }
}
