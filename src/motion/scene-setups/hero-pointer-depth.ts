import { HERO_HOOKS } from "./hero-hooks";

import type { SceneSetupContext } from "../create-scene";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const POINTER_CAN_ROTATION_DEGREES = 2.2;
const POINTER_CAN_X_PX = 10;
const POINTER_ORBIT_X_PX = 16;
type PointerSetter = ReturnType<SceneSetupContext["gsap"]["quickSetter"]>;

interface PointerSetters {
  readonly rotation: PointerSetter;
  readonly canX: PointerSetter;
  readonly orbitX: PointerSetter | null;
}

interface PointerState {
  bounds: DOMRect | null;
  event: PointerEvent | null;
  pendingFrame: boolean;
}

function resetDepth(setters: PointerSetters): void {
  Reflect.apply(setters.rotation, undefined, [0]);
  Reflect.apply(setters.canX, undefined, [0]);
  if (setters.orbitX !== null) Reflect.apply(setters.orbitX, undefined, [0]);
}

function renderDepth(
  context: SceneSetupContext,
  state: PointerState,
  setters: PointerSetters,
): void {
  state.pendingFrame = false;
  const event = state.event;
  state.event = null;
  const frame = state.bounds ?? context.root.getBoundingClientRect();
  state.bounds = frame;
  if (event === null || frame.width <= 0) return;
  const ratio = (event.clientX - frame.left) / frame.width - 0.5;
  Reflect.apply(setters.rotation, undefined, [
    ratio * POINTER_CAN_ROTATION_DEGREES,
  ]);
  Reflect.apply(setters.canX, undefined, [ratio * POINTER_CAN_X_PX]);
  if (setters.orbitX !== null)
    Reflect.apply(setters.orbitX, undefined, [-ratio * POINTER_ORBIT_X_PX]);
}

/** Pointer setters/listeners share the scene's deterministic frame and style ownership. */
export function mountPointerDepth(context: SceneSetupContext): void {
  const windowValue = context.root.ownerDocument.defaultView;
  const primaryCan = context.query<HTMLElement>(HERO_HOOKS.primary);
  const orbit = context.query<HTMLElement>(HERO_HOOKS.orbit);
  if (
    windowValue === null ||
    primaryCan === null ||
    !windowValue.matchMedia(FINE_POINTER_QUERY).matches
  )
    return;
  const setters: PointerSetters = {
    rotation: context.gsap.quickSetter(primaryCan, "rotateY", "deg"),
    canX: context.gsap.quickSetter(primaryCan, "x", "px"),
    orbitX: orbit === null ? null : context.gsap.quickSetter(orbit, "x", "px"),
  };
  const state: PointerState = {
    bounds: null,
    event: null,
    pendingFrame: false,
  };
  context.listen(context.root, "pointermove", (event): void => {
    if (!(event instanceof PointerEvent)) return;
    state.event = event;
    if (state.pendingFrame) return;
    state.pendingFrame = true;
    context.requestFrame((): void => renderDepth(context, state, setters));
  });
  context.listen(context.root, "pointerleave", (): void => resetDepth(setters));
  context.listen(windowValue, "resize", (): void => {
    state.bounds = null;
  });
  context.onCleanup((): void => resetDepth(setters));
}
