import type { SceneSetup } from "../create-scene";
import { MOTION_DURATION_SECONDS, MOTION_EASE } from "../tokens";
import { markSceneReady } from "./shared";

const SCROLL_THRESHOLD_PX = 12;
const MENU_SELECTOR = "[data-motion-menu]";

export const setupNavigation: SceneSetup = (context): (() => void) => {
  const menu = context.query<HTMLDetailsElement>(MENU_SELECTOR);
  const windowValue = context.root.ownerDocument.defaultView;
  const cleanupReady = markSceneReady(context);
  let previousY = windowValue?.scrollY ?? 0;
  let ticking = false;

  const updateDirection = (): void => {
    ticking = false;
    const nextY = windowValue?.scrollY ?? previousY;
    const delta = nextY - previousY;

    if (Math.abs(delta) < SCROLL_THRESHOLD_PX) {
      return;
    }

    context.root.dataset.scrollDirection = delta > 0 ? "down" : "up";
    previousY = nextY;
  };

  if (windowValue) {
    context.listen(windowValue, "scroll", (): void => {
      if (ticking) {
        return;
      }

      ticking = true;
      context.requestFrame(updateDirection);
    });
  }

  if (menu && context.capability.kind !== "reduced") {
    context.listen(menu, "toggle", (): void => {
      context.gsap.fromTo(
        menu,
        { autoAlpha: 0.84 },
        {
          autoAlpha: 1,
          duration: MOTION_DURATION_SECONDS.standard,
          ease: MOTION_EASE.enter,
          overwrite: true,
        },
      );
    });
  }
  return (): void => {
    delete context.root.dataset.scrollDirection;
    cleanupReady();
  };
};
