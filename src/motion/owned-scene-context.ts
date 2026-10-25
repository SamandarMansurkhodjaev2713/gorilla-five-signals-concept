import type { SceneSetupContext } from "./create-scene";
import type { MotionEngine } from "./motion-engine";
import type { SceneResources } from "./owned-scene-resources";
import type { MotionCapability } from "./scene-contract";
import type { SetupStage } from "./setup-stage-queue";

function listenOwned(options: {
  readonly resources: SceneResources;
  readonly target: EventTarget;
  readonly type: string;
  readonly listener: EventListener;
  readonly listenerOptions: AddEventListenerOptions;
}): void {
  const ownedListener: EventListener = (event): void => {
    options.resources.runOwned((): void =>
      options.listener.call(options.target, event),
    );
  };
  options.target.addEventListener(options.type, ownedListener, {
    ...options.listenerOptions,
    signal: options.resources.signal,
  });
}

export function createSceneSetupContext(options: {
  readonly stage: (callback: SetupStage) => void;
  readonly root: HTMLElement;
  readonly capability: MotionCapability;
  readonly engine: MotionEngine;
  readonly resources: SceneResources;
}): SceneSetupContext {
  const { root, resources } = options;
  return {
    root,
    capability: options.capability,
    gsap: options.engine.gsap,
    media: resources.media,
    signal: resources.signal,
    query: <ElementType extends Element>(
      selector: string,
    ): ElementType | null => root.querySelector<ElementType>(selector),
    queryAll: <ElementType extends Element>(
      selector: string,
    ): readonly ElementType[] =>
      Array.from(root.querySelectorAll<ElementType>(selector)),
    listen: (target, type, listener, listenerOptions = {}): void =>
      listenOwned({ resources, target, type, listener, listenerOptions }),
    onCleanup: resources.addCleanup,
    ownObserver: (observer): void => {
      resources.addCleanup((): void => observer.disconnect());
    },
    requestFrame: resources.requestFrame,
    runOwned: resources.runOwned,
    stage: options.stage,
  };
}
