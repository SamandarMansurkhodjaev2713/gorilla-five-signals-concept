import { publishMotionDiagnostic } from "../diagnostics";

const MEDIA_PREFERENCE_KEY = "gorilla:material-film-preference:v1";

export type MediaPreference = "autoplay" | "paused";

function publishStorageError(root: HTMLElement, error: unknown): void {
  const windowValue = root.ownerDocument.defaultView;
  if (windowValue === null) {
    return;
  }
  publishMotionDiagnostic(windowValue, {
    code: "preference-storage-failed",
    message: error instanceof Error ? error.message : "Media storage failed.",
    sceneId: "material-film",
  });
}

export function readMediaPreference(root: HTMLElement): MediaPreference {
  try {
    const stored =
      root.ownerDocument.defaultView?.localStorage.getItem(
        MEDIA_PREFERENCE_KEY,
      );
    if (stored === null || stored === undefined || stored === "autoplay") {
      return "autoplay";
    }
    if (stored === "paused") {
      return "paused";
    }
    publishStorageError(root, new Error("Invalid material-film preference."));
    return "paused";
  } catch (error: unknown) {
    publishStorageError(root, error);
    return "autoplay";
  }
}

export function writeMediaPreference(
  root: HTMLElement,
  preference: MediaPreference,
): void {
  try {
    root.ownerDocument.defaultView?.localStorage.setItem(
      MEDIA_PREFERENCE_KEY,
      preference,
    );
  } catch (error: unknown) {
    publishStorageError(root, error);
  }
}
