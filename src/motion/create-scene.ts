import type { MotionEngine } from "./motion-engine";
import { runCleanupStack, type Cleanup } from "./cleanup-stack";
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

export function createOwnedScene(options: {
  readonly id: SceneId;
  readonly root: HTMLElement;
  readonly capability: MotionCapability;
  readonly engine: MotionEngine;
  readonly setup: SceneSetup;
}): SceneHandle {
  const windowValue = options.root.ownerDocument.defaultView;
  if (windowValue === null) {
    throw new Error(`Scene "${options.id}" has no owning window.`);
  }

  const abortController = new AbortController();
  const cleanups = new Set<Cleanup>();
  const media = options.engine.gsap.matchMedia(options.root);
  let phase: ScenePhase = "mounting";
  let context: ReturnType<MotionEngine["gsap"]["context"]> | undefined;

  const requestFrame = (callback: FrameRequestCallback): Cleanup => {
    let frameId = 0;
    const cancel = (): void => {
      windowValue.cancelAnimationFrame(frameId);
      cleanups.delete(cancel);
    };

    frameId = windowValue.requestAnimationFrame((time): void => {
      cleanups.delete(cancel);
      callback(time);
    });
    cleanups.add(cancel);
    return cancel;
  };

  const setupContext: SceneSetupContext = {
    root: options.root,
    capability: options.capability,
    gsap: options.engine.gsap,
    media,
    signal: abortController.signal,
    query: <ElementType extends Element>(
      selector: string,
    ): ElementType | null => options.root.querySelector<ElementType>(selector),
    queryAll: <ElementType extends Element>(
      selector: string,
    ): readonly ElementType[] =>
      Array.from(options.root.querySelectorAll<ElementType>(selector)),
    listen: (
      target: EventTarget,
      type: string,
      listener: EventListener,
      listenerOptions: AddEventListenerOptions = {},
    ): void => {
      target.addEventListener(type, listener, {
        ...listenerOptions,
        signal: abortController.signal,
      });
    },
    onCleanup: (cleanup: Cleanup): void => {
      cleanups.add(cleanup);
    },
    ownObserver: (observer: Disconnectable): void => {
      cleanups.add((): void => observer.disconnect());
    },
    requestFrame,
    runOwned: (callback: () => void): void => {
      if (!abortController.signal.aborted) {
        context?.add(callback);
      }
    },
  };

  try {
    context = options.engine.gsap.context((): void => {
      const cleanup = options.setup(setupContext);

      if (cleanup) {
        cleanups.add(cleanup);
      }
    }, options.root);
    phase = "active";
  } catch (setupError: unknown) {
    abortController.abort();
    const emergencyCleanups: Cleanup[] = [
      ...cleanups,
      (): void => media.revert(),
      (): void => context?.revert(),
    ];
    cleanups.clear();

    try {
      runCleanupStack(
        emergencyCleanups,
        "One or more emergency scene resources failed to clean up.",
      );
    } catch (cleanupError: unknown) {
      throw new AggregateError(
        [setupError, cleanupError],
        `Scene "${options.id}" failed during setup and cleanup.`,
        { cause: cleanupError },
      );
    }

    throw new Error(
      `Scene "${options.id}" failed during setup: ${describeError(setupError)}`,
      { cause: setupError },
    );
  }

  return {
    id: options.id,
    capability: options.capability,
    getPhase: (): ScenePhase => phase,
    destroy: (): void => {
      if (phase === "destroying" || phase === "destroyed") {
        return;
      }

      phase = "destroying";
      abortController.abort();

      const ownedCleanups: Cleanup[] = [
        ...cleanups,
        (): void => media.revert(),
        (): void => context?.revert(),
      ];
      cleanups.clear();

      try {
        runCleanupStack(
          ownedCleanups,
          "One or more owned scene resources failed to clean up.",
        );
      } finally {
        phase = "destroyed";
      }
    },
  };
}
