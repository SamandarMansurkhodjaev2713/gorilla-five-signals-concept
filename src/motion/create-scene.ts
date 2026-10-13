import { createSceneSetupContext } from "./owned-scene-context";
import {
  createSceneResources,
  type SceneResources,
} from "./owned-scene-resources";

import type { Cleanup } from "./cleanup-stack";
import type { MotionEngine } from "./motion-engine";
import type {
  MotionCapability,
  SceneHandle,
  SceneId,
  ScenePhase,
} from "./scene-contract";

interface Disconnectable {
  disconnect(): void;
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export interface SceneSetupContext {
  readonly root: HTMLElement;
  readonly capability: MotionCapability;
  readonly gsap: MotionEngine["gsap"];
  readonly media: ReturnType<MotionEngine["gsap"]["matchMedia"]>;
  readonly signal: AbortSignal;
  query<ElementType extends Element>(selector: string): ElementType | null;
  queryAll<ElementType extends Element>(
    selector: string,
  ): readonly ElementType[];
  listen(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions,
  ): void;
  onCleanup(cleanup: Cleanup): void;
  ownObserver(observer: Disconnectable): void;
  requestFrame(callback: FrameRequestCallback): Cleanup;
  runOwned(callback: () => void): void;
}

export type SceneSetup = (context: SceneSetupContext) => void | Cleanup;

interface OwnedSceneOptions {
  readonly id: SceneId;
  readonly root: HTMLElement;
  readonly capability: MotionCapability;
  readonly engine: MotionEngine;
  readonly setup: SceneSetup;
}

function rollbackSetup(
  resources: SceneResources,
  id: SceneId,
  setupError: unknown,
): never {
  try {
    resources.release(
      "One or more emergency scene resources failed to clean up.",
    );
  } catch (cleanupError: unknown) {
    throw new AggregateError(
      [setupError, cleanupError],
      `Scene "${id}" failed during setup and cleanup.`,
      { cause: cleanupError },
    );
  }
  throw new Error(
    `Scene "${id}" failed during setup: ${describeError(setupError)}`,
    { cause: setupError },
  );
}

function runSceneSetup(
  options: OwnedSceneOptions,
  resources: SceneResources,
): void {
  const setupContext = createSceneSetupContext({ ...options, resources });
  try {
    const context = options.engine.gsap.context((): void => {
      const cleanup = options.setup(setupContext);
      if (cleanup) resources.addCleanup(cleanup);
    }, options.root);
    resources.assignContext(context);
  } catch (setupError: unknown) {
    rollbackSetup(resources, options.id, setupError);
  }
}

function createSceneHandle(
  options: OwnedSceneOptions,
  resources: SceneResources,
): SceneHandle {
  let phase: ScenePhase = "active";
  return {
    id: options.id,
    capability: options.capability,
    getPhase: (): ScenePhase => phase,
    destroy: (): void => {
      if (phase === "destroying" || phase === "destroyed") {
        return;
      }

      phase = "destroying";
      try {
        resources.release(
          "One or more owned scene resources failed to clean up.",
        );
      } finally {
        phase = "destroyed";
      }
    },
  };
}

export function createOwnedScene(options: OwnedSceneOptions): SceneHandle {
  const windowValue = options.root.ownerDocument.defaultView;
  if (windowValue === null) {
    throw new Error(`Scene "${options.id}" has no owning window.`);
  }
  const resources = createSceneResources({ ...options, windowValue });
  runSceneSetup(options, resources);
  return createSceneHandle(options, resources);
}
