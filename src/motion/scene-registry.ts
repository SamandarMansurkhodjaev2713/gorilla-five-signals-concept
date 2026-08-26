import type { SceneHandle, SceneId } from "./scene-contract";
import { runCleanupStack } from "./cleanup-stack";

export interface SceneRegistry {
  has(id: SceneId): boolean;
  mount(handle: SceneHandle): void;
  unmount(id: SceneId): void;
  destroy(): void;
}

export function createSceneRegistry(): SceneRegistry {
  const handles = new Map<SceneId, SceneHandle>();
  let destroyed = false;

  return {
    has: (id): boolean => handles.has(id),
    mount: (handle): void => {
      if (destroyed) {
        handle.destroy();
        throw new Error("Cannot mount a scene into a destroyed registry.");
      }

      if (handles.has(handle.id)) {
        handle.destroy();
        throw new Error(`Scene "${handle.id}" is already mounted.`);
      }

      handles.set(handle.id, handle);
    },
    unmount: (id): void => {
      const handle = handles.get(id);

      if (!handle) {
        return;
      }

      handles.delete(id);
      handle.destroy();
    },
    destroy: (): void => {
      if (destroyed) {
        return;
      }

      destroyed = true;
      const mountedHandles = [...handles.values()];
      handles.clear();
      runCleanupStack(
        mountedHandles.map((handle) => (): void => handle.destroy()),
        "One or more scenes failed to unmount.",
      );
    },
  };
}
