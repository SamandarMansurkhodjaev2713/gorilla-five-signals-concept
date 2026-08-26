import { createOwnedScene } from "../create-scene";
import { runCleanupStack } from "../cleanup-stack";
import type { MotionEngine } from "../motion-engine";
import {
  SCENE_DEFINITIONS,
  type MotionCapability,
  type SceneDefinition,
} from "../scene-contract";
import { createSceneRegistry, type SceneRegistry } from "../scene-registry";
import { SCENE_SETUPS } from "../scene-setups";
import { mountMaterialFilmController } from "../scene-setups/media";

const PROXIMITY_MARGIN = "320px 0px";
const PRODUCT_WORLD_SCENE = "product-world";
const REDUCED_MOTION_READY = "reduced";
const STATIC_WORLD_ENTRANCE = "static";

export interface MotionSceneEnvironment {
  destroy(): void;
}

function rootsFor(
  documentValue: Document,
  definition: SceneDefinition,
): readonly HTMLElement[] {
  return Array.from(
    documentValue.querySelectorAll<HTMLElement>(definition.selector),
  );
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

function mountScene(
  root: HTMLElement,
  definition: SceneDefinition,
  capability: MotionCapability,
  engine: MotionEngine,
  registry: SceneRegistry,
): void {
  registry.mount(
    createOwnedScene({
      id: definition.id,
      root,
      capability,
      engine,
      setup: SCENE_SETUPS[definition.id],
    }),
  );
}

function waitForAnimationFrame(windowValue: Window): Promise<void> {
  return new Promise((resolve) =>
    windowValue.requestAnimationFrame((): void => resolve()),
  );
}

async function mountImmediateScenes(options: {
  readonly documentValue: Document;
  readonly capability: MotionCapability;
  readonly engine: MotionEngine;
  readonly registry: SceneRegistry;
  readonly deferred: Map<Element, SceneDefinition>;
  readonly report: (sceneId: string, error: unknown) => void;
}): Promise<void> {
  const windowValue = options.documentValue.defaultView;
  if (windowValue === null) {
    throw new Error("The motion document has no owning window.");
  }

  for (const definition of SCENE_DEFINITIONS) {
    for (const root of rootsFor(options.documentValue, definition)) {
      if (definition.mountOnceVisible) {
        options.deferred.set(root, definition);
        continue;
      }

      try {
        await waitForAnimationFrame(windowValue);
        mountScene(
          root,
          definition,
          options.capability,
          options.engine,
          options.registry,
        );
      } catch (error: unknown) {
        options.report(definition.id, error);
      }
    }
  }
}

function mountObservedScene(options: {
  readonly entry: IntersectionObserverEntry;
  readonly definition: SceneDefinition;
  readonly capability: MotionCapability;
  readonly engine: MotionEngine;
  readonly registry: SceneRegistry;
  readonly report: (sceneId: string, error: unknown) => void;
}): void {
  if (!(options.entry.target instanceof HTMLElement)) {
    options.report(options.definition.id, new Error("Scene root is not HTML."));
    return;
  }

  try {
    mountScene(
      options.entry.target,
      options.definition,
      options.capability,
      options.engine,
      options.registry,
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
  readonly report: (sceneId: string, error: unknown) => void;
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
  readonly report: (sceneId: string, error: unknown) => void;
}): Promise<MotionSceneEnvironment> {
  const registry = createSceneRegistry();
  const deferred = new Map<Element, SceneDefinition>();
  await mountImmediateScenes({ ...options, registry, deferred });

  if (deferred.size === 0) {
    return { destroy: (): void => registry.destroy() };
  }

  const observer = createDeferredObserver({ ...options, registry, deferred });
  let destroyed = false;

  for (const root of deferred.keys()) {
    observer.observe(root);
  }

  return {
    destroy: (): void => {
      if (destroyed) {
        return;
      }
      destroyed = true;
      runCleanupStack(
        [(): void => registry.destroy(), (): void => observer.disconnect()],
        "The enhanced motion environment failed to destroy completely.",
      );
    },
  };
}
