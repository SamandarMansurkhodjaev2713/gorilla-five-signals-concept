import { runCleanupStack, type Cleanup } from "./cleanup-stack";

import type { MotionEngine } from "./motion-engine";

type GsapContext = ReturnType<MotionEngine["gsap"]["context"]>;

interface ResourceState {
  readonly controller: AbortController;
  readonly cleanups: Set<Cleanup>;
  context: GsapContext | undefined;
}

export interface SceneResources {
  readonly media: ReturnType<MotionEngine["gsap"]["matchMedia"]>;
  readonly signal: AbortSignal;
  addCleanup(this: void, cleanup: Cleanup): void;
  assignContext(this: void, context: GsapContext): void;
  release(this: void, failureMessage: string): void;
  requestFrame(this: void, callback: FrameRequestCallback): Cleanup;
  runOwned(this: void, callback: () => void): void;
}

function runOwned(state: ResourceState, callback: () => void): void {
  if (!state.controller.signal.aborted) state.context?.add(callback);
}

function requestFrame(
  state: ResourceState,
  windowValue: Window,
  callback: FrameRequestCallback,
): Cleanup {
  let frameId = 0;
  const cancel = (): void => {
    windowValue.cancelAnimationFrame(frameId);
    state.cleanups.delete(cancel);
  };
  frameId = windowValue.requestAnimationFrame((time): void => {
    state.cleanups.delete(cancel);
    runOwned(state, (): void => callback(time));
  });
  state.cleanups.add(cancel);
  return cancel;
}

function releaseResources(
  state: ResourceState,
  media: SceneResources["media"],
  failureMessage: string,
): void {
  state.controller.abort();
  const cleanups: Cleanup[] = [
    (): void => state.context?.revert(),
    (): void => media.revert(),
    ...state.cleanups,
  ];
  state.cleanups.clear();
  runCleanupStack(cleanups, failureMessage);
}

export function createSceneResources(options: {
  readonly root: HTMLElement;
  readonly engine: MotionEngine;
  readonly windowValue: Window;
}): SceneResources {
  const state: ResourceState = {
    controller: new AbortController(),
    cleanups: new Set(),
    context: undefined,
  };
  const media = options.engine.gsap.matchMedia(options.root);
  return {
    media,
    signal: state.controller.signal,
    addCleanup: (cleanup): void => {
      state.cleanups.add(cleanup);
    },
    assignContext: (context): void => {
      state.context = context;
    },
    release: (failureMessage): void =>
      releaseResources(state, media, failureMessage),
    requestFrame: (callback): Cleanup =>
      requestFrame(state, options.windowValue, callback),
    runOwned: (callback): void => runOwned(state, callback),
  };
}
