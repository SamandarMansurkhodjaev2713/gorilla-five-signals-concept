import type { SceneSetup } from "../create-scene";
import { runCleanupStack } from "../cleanup-stack";
import { publishMotionDiagnostic } from "../diagnostics";
import {
  CONTROLS_SELECTOR,
  MEDIA_AUTOPLAY_SETTLE_MS,
  MEDIA_PROXIMITY_MARGIN,
  MEDIA_SELECTOR,
  MEDIA_VISIBLE_THRESHOLD,
  PAUSE_SELECTOR,
  PLAY_SELECTOR,
  createPlaybackSession,
  type MediaControllerPolicy,
  type PlaybackSession,
} from "./media-contract";
import {
  cancelPendingPlayback,
  completePlayback,
  handlePlayFailure,
  pauseMedia,
  setMediaState,
  setStatus,
  startPlayback,
} from "./media-playback";
import { readMediaPreference, writeMediaPreference } from "./media-preference";
import { releaseMedia } from "./media-resource";
import { markSceneReady } from "./shared";

function listen(
  signal: AbortSignal,
  target: EventTarget,
  type: string,
  listener: EventListener,
): void {
  target.addEventListener(type, listener, { signal });
}

function mountControls(
  root: HTMLElement,
  media: HTMLVideoElement,
  session: PlaybackSession,
  signal: AbortSignal,
): void {
  root.querySelector<HTMLElement>(CONTROLS_SELECTOR)?.removeAttribute("hidden");
  listen(signal, root, "click", (event): void => {
    if (!(event.target instanceof Element)) {
      return;
    }
    if (event.target.closest(PLAY_SELECTOR)) {
      writeMediaPreference(root, "autoplay");
      session.autoPlayback = "active";
      setStatus(root);
      startPlayback(root, media, session);
    } else if (event.target.closest(PAUSE_SELECTOR)) {
      writeMediaPreference(root, "paused");
      pauseMedia(root, media, session);
    }
  });
}

function mountPlaybackEvents(
  root: HTMLElement,
  media: HTMLVideoElement,
  session: PlaybackSession,
  signal: AbortSignal,
): void {
  listen(signal, media, "playing", (): void => {
    if (
      session.phase === "active" &&
      session.autoPlayback !== "failed" &&
      !media.paused
    ) {
      cancelPendingPlayback(root, session);
      setMediaState(root, "playing");
      setStatus(root);
    }
  });
  listen(signal, media, "error", (): void => {
    handlePlayFailure(
      root,
      media,
      session,
      media.error ?? new Error("Video decode failed."),
    );
  });
  listen(signal, media, "ended", (): void => {
    if (session.phase === "active") {
      completePlayback(root, media, session);
    }
  });
}

function mountVisibilityPause(
  root: HTMLElement,
  media: HTMLVideoElement,
  session: PlaybackSession,
  signal: AbortSignal,
): void {
  const documentValue = root.ownerDocument;
  listen(signal, documentValue, "visibilitychange", (): void => {
    session.documentVisible = !documentValue.hidden;
    if (documentValue.hidden) {
      session.resumeAfterVisibility =
        root.dataset.mediaState === "loading" ||
        root.dataset.mediaState === "playing";
      pauseMedia(root, media, session);
      return;
    }
    session.resumeAfterVisibility = false;
    reconcileAutomaticPlayback(root, media, session);
  });
}

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
  } else if (!session.documentVisible || !session.inProximity) {
    pauseMedia(root, media, session);
  }
}

function mountProximityPlayback(
  root: HTMLElement,
  media: HTMLVideoElement,
  session: PlaybackSession,
  signal: AbortSignal,
): () => void {
  const windowValue = root.ownerDocument.defaultView;
  let playbackTimerId: number | null = null;
  const cancelScheduledPlayback = (): void => {
    if (playbackTimerId === null || windowValue === null) {
      return;
    }
    windowValue.clearTimeout(playbackTimerId);
    playbackTimerId = null;
  };
  const schedulePlayback = (): void => {
    cancelScheduledPlayback();
    if (windowValue === null) {
      return;
    }
    playbackTimerId = windowValue.setTimeout((): void => {
      playbackTimerId = null;
      reconcileAutomaticPlayback(root, media, session);
    }, MEDIA_AUTOPLAY_SETTLE_MS);
  };
  const observer = new IntersectionObserver(
    (entries): void => {
      session.inProximity = entries.some((entry) => entry.isIntersecting);
      if (session.inProximity) {
        schedulePlayback();
        return;
      }
      cancelScheduledPlayback();
      session.resumeAfterVisibility = false;
      reconcileAutomaticPlayback(root, media, session);
    },
    {
      rootMargin: MEDIA_PROXIMITY_MARGIN,
      threshold: MEDIA_VISIBLE_THRESHOLD,
    },
  );
  observer.observe(root);
  if (windowValue !== null) {
    windowValue.addEventListener(
      "scroll",
      (): void => {
        if (session.inProximity) {
          schedulePlayback();
        }
      },
      { passive: true, signal },
    );
  }
  return (): void => {
    cancelScheduledPlayback();
    observer.disconnect();
  };
}

function readMaterialFilmMedia(root: HTMLElement): HTMLVideoElement | null {
  const requiredSelectors = [
    MEDIA_SELECTOR,
    CONTROLS_SELECTOR,
    PLAY_SELECTOR,
    PAUSE_SELECTOR,
    "[data-motion-media-status]",
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

function resetMediaScene(
  root: HTMLElement,
  media: HTMLVideoElement,
  session: PlaybackSession,
): void {
  runCleanupStack(
    [
      (): void => {
        delete root.dataset.mediaState;
      },
      (): void => setStatus(root),
      (): void =>
        root
          .querySelector<HTMLElement>(CONTROLS_SELECTOR)
          ?.setAttribute("hidden", ""),
      (): void => releaseMedia(media),
      (): void => {
        session.phase = "destroyed";
        session.generation += 1;
      },
      (): void => cancelPendingPlayback(root, session),
    ],
    "One or more material-film resources failed to clean up.",
  );
}

export function mountMaterialFilmController(
  root: HTMLElement,
  policy: MediaControllerPolicy,
): () => void {
  const media = readMaterialFilmMedia(root);
  if (media === null) {
    return (): void => undefined;
  }

  const controller = new AbortController();
  const session = createPlaybackSession(!root.ownerDocument.hidden);
  const cleanupProximity =
    policy.kind === "proximity-autoplay"
      ? mountProximityPlayback(root, media, session, controller.signal)
      : (): void => undefined;
  setMediaState(root, "poster");
  if (policy.kind !== "poster-only") {
    mountControls(root, media, session, controller.signal);
    mountPlaybackEvents(root, media, session, controller.signal);
    mountVisibilityPause(root, media, session, controller.signal);
  }

  let destroyed = false;

  return (): void => {
    if (destroyed) {
      return;
    }
    destroyed = true;
    runCleanupStack(
      [
        (): void => resetMediaScene(root, media, session),
        cleanupProximity,
        (): void => controller.abort(),
      ],
      "The material-film controller failed to destroy completely.",
    );
  };
}

export const setupMaterialFilm: SceneSetup = (context): (() => void) => {
  const cleanupReady = markSceneReady(context);
  const policy: MediaControllerPolicy =
    context.capability.kind === "full"
      ? { kind: "proximity-autoplay" }
      : { kind: "poster-only" };
  const cleanupMedia = mountMaterialFilmController(context.root, policy);
  return (): void => {
    runCleanupStack(
      [cleanupReady, cleanupMedia],
      "The material-film scene failed to clean up completely.",
    );
  };
};
