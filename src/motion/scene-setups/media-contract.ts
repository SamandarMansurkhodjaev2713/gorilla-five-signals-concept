export const MEDIA_SELECTOR = "video[data-motion-media]";
export const CONTROLS_SELECTOR = "[data-motion-media-controls]";
export const PLAY_SELECTOR = "[data-motion-media-play]";
export const PAUSE_SELECTOR = "[data-motion-media-pause]";
export const MEDIA_PROXIMITY_MARGIN = "180px 0px";
export const MEDIA_VISIBLE_THRESHOLD = 0.18;
export const MEDIA_AUTOPLAY_SETTLE_MS = 240;
export const MEDIA_PLAYBACK_TIMEOUT_MS = 5_000;

export interface PlaybackSession {
  autoPlayback: "idle" | "active" | "completed" | "failed";
  documentVisible: boolean;
  generation: number;
  inProximity: boolean;
  phase: "active" | "destroyed";
  playbackTimeoutId: number | null;
  resumeAfterVisibility: boolean;
}

export type MediaControllerPolicy =
  | { readonly kind: "proximity-autoplay" }
  | { readonly kind: "intent-only" }
  | { readonly kind: "poster-only" };

export function createPlaybackSession(
  documentVisible: boolean,
): PlaybackSession {
  return {
    autoPlayback: "idle",
    documentVisible,
    generation: 0,
    inProximity: false,
    phase: "active",
    playbackTimeoutId: null,
    resumeAfterVisibility: false,
  };
}
