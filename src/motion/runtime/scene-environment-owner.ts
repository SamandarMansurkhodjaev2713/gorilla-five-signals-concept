import { runCleanupStack } from "../cleanup-stack";

import type { SceneRegistry } from "../scene-registry";

/** Own partial activation as well as the final observer, including supersession. */
export function createSceneEnvironmentOwner(options: {
  readonly registry: SceneRegistry;
  readonly deferred: Map<Element, unknown>;
  readonly signal: AbortSignal;
  readonly report: (sceneId: string | undefined, error: unknown) => void;
}) {
  let observer: IntersectionObserver | null = null;
  let destroyed = false;
  const destroy = (): void => {
    if (destroyed) return;
    destroyed = true;
    options.signal.removeEventListener("abort", cancel);
    options.deferred.clear();
    runCleanupStack(
      [() => options.registry.destroy(), () => observer?.disconnect()],
      "The enhanced motion environment failed to destroy completely.",
    );
  };
  const cancel = (): void => {
    try {
      destroy();
    } catch (error: unknown) {
      options.report(undefined, error);
    }
  };
  options.signal.addEventListener("abort", cancel, { once: true });
  if (options.signal.aborted) cancel();
  return {
    destroy,
    assignObserver: (value: IntersectionObserver): void => {
      if (destroyed) value.disconnect();
      else observer = value;
    },
  };
}
