import { publishMotionDiagnostic } from "../diagnostics";
import {
  CONTROLS_SELECTOR,
  MEDIA_SELECTOR,
  PAUSE_SELECTOR,
  PLAY_SELECTOR,
} from "./media-contract";

const STATUS_SELECTOR = "[data-motion-media-status]";

export function readMaterialFilmMedia(
  root: HTMLElement,
): HTMLVideoElement | null {
  const requiredSelectors = [
    MEDIA_SELECTOR,
    CONTROLS_SELECTOR,
    PLAY_SELECTOR,
    PAUSE_SELECTOR,
    STATUS_SELECTOR,
  ];
  const missing = requiredSelectors.filter(
    (selector) => root.querySelector(selector) === null,
  );
  const media = root.querySelector<HTMLVideoElement>(MEDIA_SELECTOR);
  if (missing.length === 0 && media !== null) {
    return media;
  }
  const windowValue = root.ownerDocument.defaultView;
  if (windowValue !== null) {
    publishMotionDiagnostic(windowValue, {
      code: "controller-contract-invalid",
      message: `Material-film DOM contract is missing: ${missing.join(", ")}.`,
      sceneId: "material-film",
    });
  }
  return null;
}
