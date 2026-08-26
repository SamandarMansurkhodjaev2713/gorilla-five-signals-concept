import type { SceneSetup } from "../create-scene";
import type { SceneId } from "../scene-contract";
import {
  setupContactSwitchboardScene,
  setupContactScene,
  setupCultureAtlasScene,
  setupCultureScene,
  setupFindHandoffScene,
  setupLocatorScene,
} from "./editorial";
import { setupHero } from "./hero";
import { setupManifesto } from "./manifesto";
import { setupMaterialFilm } from "./media";
import { setupNavigation } from "./navigation";
import { setupInteractiveProduct, setupProductLab } from "./product";
import {
  createFiniteReveal,
  createSignalSequence,
  markSceneReady,
  playOnceWhenVisible,
} from "./shared";

const setupRevealScene: SceneSetup = (context): (() => void) => {
  const cleanupReady = markSceneReady(context);
  playOnceWhenVisible(context, (): void => {
    createFiniteReveal(context);
  });
  return cleanupReady;
};

const setupSignalScene: SceneSetup = (context): (() => void) => {
  const cleanupReady = markSceneReady(context);
  playOnceWhenVisible(context, (): void => {
    createSignalSequence(context);
  });
  return cleanupReady;
};

export const SCENE_SETUPS: Readonly<Record<SceneId, SceneSetup>> = {
  "responsible-entry": setupSignalScene,
  navigation: setupNavigation,
  hero: setupHero,
  "range-manifesto": setupManifesto,
  "flavor-explorer": setupInteractiveProduct,
  "product-lab": setupProductLab,
  "product-compare": setupInteractiveProduct,
  "material-film": setupMaterialFilm,
  "culture-signal": setupCultureScene,
  "store-locator": setupLocatorScene,
  "culture-atlas": setupCultureAtlasScene,
  "find-handoff": setupFindHandoffScene,
  "faq-safety": setupRevealScene,
  "contact-partnership": setupContactScene,
  "contact-switchboard": setupContactSwitchboardScene,
  footer: setupSignalScene,
};
