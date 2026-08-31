import type { SceneSetup } from "../create-scene";
import { setupFlavorReactor } from "../../features/flavor-reactor/flavor-reactor-motion";
import { setupHomeDuel, setupHomeTruth } from "./home-truth-compare-motion";
import { setupProductCompare } from "./product-compare-motion";

const HOME_DUEL_CLASS = "home-duel";
const HOME_TRUTH_CLASS = "home-truth";

export const setupProductLab: SceneSetup = (context): void | (() => void) => {
  if (context.root.classList.contains(HOME_TRUTH_CLASS)) {
    return setupHomeTruth(context);
  }

  return setupProductCompare(context);
};

export const setupInteractiveProduct: SceneSetup = (
  context,
): void | (() => void) => {
  if (context.root.hasAttribute("data-product-explorer")) {
    return setupFlavorReactor(context);
  }
  if (context.root.classList.contains(HOME_DUEL_CLASS)) {
    return setupHomeDuel(context);
  }
  return setupProductCompare(context);
};
