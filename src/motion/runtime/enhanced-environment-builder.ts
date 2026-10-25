import { createEnhancedEnvironment } from "./scene-environment";

import type { MotionSceneEnvironment } from "./scene-environment";

type EnvironmentOptions = Omit<
  Parameters<typeof createEnhancedEnvironment>[0],
  "signal"
>;

/** Superseding a capability build releases its partial scenes, not merely its result. */
export function createEnhancedEnvironmentBuilder() {
  let controller: AbortController | null = null;
  return {
    cancel: (): void => {
      const previous = controller;
      controller = null;
      previous?.abort();
    },
    build: async (
      options: EnvironmentOptions,
    ): Promise<MotionSceneEnvironment> => {
      const next = new AbortController();
      controller = next;
      try {
        return await createEnhancedEnvironment({
          ...options,
          signal: next.signal,
        });
      } finally {
        if (controller === next) controller = null;
      }
    },
  };
}
