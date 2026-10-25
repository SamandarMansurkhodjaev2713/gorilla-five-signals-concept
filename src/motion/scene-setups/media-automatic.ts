import {
  MEDIA_AUTOPLAY_SETTLE_MS,
  MEDIA_PROXIMITY_MARGIN,
  MEDIA_VISIBLE_THRESHOLD,
  type PlaybackSession,
} from "./media-contract";
import { pauseMedia, startPlayback } from "./media-playback";
import { readMediaPreference } from "./media-preference";

function canStartAutomatically(
  root: HTMLElement,
  session: PlaybackSession,
): boolean {
  const state = root.dataset.mediaState;
  return (
    session.documentVisible &&
    session.inProximity &&
    session.autoPlayback !== "completed" &&
    session.autoPlayback !== "failed" &&
    state !== "loading" &&
    state !== "playing" &&
    readMediaPreference(root) !== "paused"
  );
}

function reconcileAutomaticPlayback(
  root: HTMLElement,
  media: HTMLVideoElement,
  session: PlaybackSession,
): void {
  if (canStartAutomatically(root, session)) {
    session.autoPlayback = "active";
    startPlayback(root, media, session);
    return;
  }
  if (!session.documentVisible || !session.inProximity) {
    pauseMedia(root, media, session, "poster");
  }
}

export function mountMediaVisibility(
  root: HTMLElement,
  media: HTMLVideoElement,
  session: PlaybackSession,
  signal: AbortSignal,
): void {
  const documentValue = root.ownerDocument;
  documentValue.addEventListener(
    "visibilitychange",
    (): void => {
      session.documentVisible = !documentValue.hidden;
      if (!session.documentVisible) {
        pauseMedia(root, media, session, "poster");
      } else if (session.inProximity) {
        reconcileAutomaticPlayback(root, media, session);
      }
    },
    { signal },
  );
}

function createPlaybackScheduler(
  root: HTMLElement,
  media: HTMLVideoElement,
  session: PlaybackSession,
): { readonly cancel: () => void; readonly schedule: () => void } {
  const windowValue = root.ownerDocument.defaultView;
  let timerId: number | null = null;
  const cancel = (): void => {
    if (timerId !== null && windowValue !== null) {
      windowValue.clearTimeout(timerId);
      timerId = null;
    }
  };
  return {
    cancel,
    schedule: (): void => {
      cancel();
      if (windowValue === null) return;
      timerId = windowValue.setTimeout((): void => {
        timerId = null;
        reconcileAutomaticPlayback(root, media, session);
      }, MEDIA_AUTOPLAY_SETTLE_MS);
    },
  };
}

export function mountAutomaticMedia(
  root: HTMLElement,
  media: HTMLVideoElement,
  session: PlaybackSession,
): () => void {
  const scheduler = createPlaybackScheduler(root, media, session);
  const observer = new IntersectionObserver(
    (entries): void => {
      session.inProximity = entries.some((entry) => entry.isIntersecting);
      if (session.inProximity) {
        scheduler.schedule();
        return;
      }
      scheduler.cancel();
      reconcileAutomaticPlayback(root, media, session);
    },
    {
      rootMargin: MEDIA_PROXIMITY_MARGIN,
      threshold: MEDIA_VISIBLE_THRESHOLD,
    },
  );
  observer.observe(root);
  return (): void => {
    scheduler.cancel();
    observer.disconnect();
  };
}
