import { runCleanupStack } from "../cleanup-stack";
import type { MotionEngine } from "../motion-engine";
import { type MotionCapability, type SceneDefinition } from "../scene-contract";
import { createSceneRegistry, type SceneRegistry } from "../scene-registry";
import { mountImmediateScenes, mountScene } from "./immediate-scene-mount";
import { createSceneEnvironmentOwner } from "./scene-environment-owner";
import { mountMaterialFilmController } from "../scene-setups/media";
import { resetProductWorldPresentation } from "../scene-setups/product-world-presentation";

const PROXIMITY_MARGIN = "320px 0px";
const PRODUCT_WORLD_SCENE = "product-world";
const REDUCED_MOTION_READY = "reduced";
const STATIC_WORLD_ENTRANCE = "static";

export interface MotionSceneEnvironment {
  destroy(): void;
}

export function createReducedEnvironment(
  documentValue: Document,
): MotionSceneEnvironment {
  const roots = Array.from(
    documentValue.querySelectorAll<HTMLElement>("[data-motion-scene]"),
  );
  const mediaCleanups: (() => void)[] = [];
  let destroyed = false;

  for (const root of roots) {
    root.dataset.motionReady = REDUCED_MOTION_READY;
    if (
      root.dataset.motionScene === PRODUCT_WORLD_SCENE &&
      root.dataset.productWorld !== undefined
    ) {
      resetProductWorldPresentation(root);
      root.dataset.worldEntranceReady = STATIC_WORLD_ENTRANCE;
    }
    if (root.dataset.motionScene === "material-film") {
      mediaCleanups.push(
        mountMaterialFilmController(root, { kind: "poster-only" }),
      );
    }
  }

  return {
    destroy: (): void => {
      if (destroyed) {
        return;
      }
      destroyed = true;
      runCleanupStack(
        [
          ...roots.map((root) => (): void => {
            if (root.dataset.motionReady === REDUCED_MOTION_READY) {
              delete root.dataset.motionReady;
            }
            if (root.dataset.worldEntranceReady === STATIC_WORLD_ENTRANCE) {
              delete root.dataset.worldEntranceReady;
            }
          }),
          ...mediaCleanups,
        ],
        "The reduced motion environment failed to destroy completely.",
      );
    },
  };
}

function mountObservedScene(options: {
  readonly entry: IntersectionObserverEntry;
  readonly definition: SceneDefinition;
  readonly capability: MotionCapability;
  readonly engine: MotionEngine;
  readonly registry: SceneRegistry;
  readonly report: (sceneId: string | undefined, error: unknown) => void;
}): void {
  if (!(options.entry.target instanceof HTMLElement)) {
    options.report(options.definition.id, new Error("Scene root is not HTML."));
    return;
  }

  try {
    const handle = mountScene({ ...options, root: options.entry.target });
    void handle.ready.catch((error: unknown): void =>
      options.report(options.definition.id, error),
    );
  } catch (error: unknown) {
    options.report(options.definition.id, error);
  }
}

function createDeferredObserver(options: {
  readonly deferred: Map<Element, SceneDefinition>;
  readonly capability: MotionCapability;
  readonly engine: MotionEngine;
  readonly registry: SceneRegistry;
  readonly report: (sceneId: string | undefined, error: unknown) => void;
}): IntersectionObserver {
  return new IntersectionObserver(
    (entries, observer): void => {
      for (const entry of entries) {
        const definition = options.deferred.get(entry.target);

        if (!entry.isIntersecting || !definition) {
          continue;
        }

        observer.unobserve(entry.target);
        options.deferred.delete(entry.target);
        mountObservedScene({ ...options, entry, definition });
      }
    },
    { rootMargin: PROXIMITY_MARGIN, threshold: 0.01 },
  );
}

export async function createEnhancedEnvironment(options: {
  readonly documentValue: Document;
  readonly capability: MotionCapability;
  readonly engine: MotionEngine;
  readonly signal: AbortSignal;
  readonly report: (sceneId: string | undefined, error: unknown) => void;
}): Promise<MotionSceneEnvironment> {
  const registry = createSceneRegistry();
  const deferred = new Map<Element, SceneDefinition>();
  const owner = createSceneEnvironmentOwner({ ...options, registry, deferred });
  try {
    await mountImmediateScenes({ ...options, registry, deferred });
    if (options.signal.aborted || deferred.size === 0) return owner;
    const observer = createDeferredObserver({ ...options, registry, deferred });
    owner.assignObserver(observer);
    for (const root of deferred.keys()) observer.observe(root);
    return owner;
  } catch (cause: unknown) {
    try {
      owner.destroy();
    } catch (cleanupError: unknown) {
      throw new AggregateError(
        [cause, cleanupError],
        "Motion activation and rollback failed.",
        { cause: cleanupError },
      );
    }
    throw cause;
  }
}
