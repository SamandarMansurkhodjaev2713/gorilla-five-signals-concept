import type { SceneSetup } from "../create-scene";
import { runCleanupStack } from "../cleanup-stack";
import {
  CONTROLS_SELECTOR,
  PAUSE_SELECTOR,
  PLAY_SELECTOR,
  createPlaybackSession,
  type MediaControllerPolicy,
  type PlaybackSession,
} from "./media-contract";
import { readMaterialFilmMedia } from "./media-elements";
import { mountAutomaticMedia, mountMediaVisibility } from "./media-automatic";
import {
  cancelPendingPlayback,
  completePlayback,
  handlePlayFailure,
  pauseMedia,
  setMediaState,
  setStatus,
  startPlayback,
} from "./media-playback";
import { mountMaterialFilmMotion } from "./material-film-motion";
import { writeMediaPreference } from "./media-preference";
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
      ? mountAutomaticMedia(root, media, session)
      : (): void => undefined;
  releaseMedia(media);
  setMediaState(root, "poster");
  if (policy.kind !== "poster-only") {
    mountControls(root, media, session, controller.signal);
    mountPlaybackEvents(root, media, session, controller.signal);
    mountMediaVisibility(root, media, session, controller.signal);
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
      : context.capability.kind === "lite"
        ? { kind: "intent-only" }
        : { kind: "poster-only" };
  mountMaterialFilmMotion(context);
  const cleanupMedia = mountMaterialFilmController(context.root, policy);
  return (): void => {
    runCleanupStack(
      [cleanupReady, cleanupMedia],
      "The material-film scene failed to clean up completely.",
    );
  };
};
