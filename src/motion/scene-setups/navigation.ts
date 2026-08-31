import type { SceneSetup } from "../create-scene";
import { setupNavigationMenuMotion } from "./navigation-menu-motion";
import { setupNavigationPointerResponse } from "./navigation-pointer-response";
import { markSceneReady } from "./shared";

export const setupNavigation: SceneSetup = (context): (() => void) => {
  const cleanups = [
    markSceneReady(context),
    setupNavigationMenuMotion(context),
    setupNavigationPointerResponse(context),
  ];

  return (): void => {
    for (const cleanup of cleanups.reverse()) {
      cleanup();
    }
  };
};
