import {
  MEDIA_PLAYBACK_TIMEOUT_MS,
  PAUSE_SELECTOR,
  PLAY_SELECTOR,
  type PlaybackSession,
} from "./media-contract";
import { exposeMedia, releaseMedia } from "./media-resource";

const STATUS_SELECTOR = "[data-motion-media-status]";

type MediaState =
  "poster" | "loading" | "playing" | "paused" | "ended" | "error";
type PauseOutcome = "paused" | "poster";

function isCurrent(session: PlaybackSession, generation: number): boolean {
  return session.phase === "active" && session.generation === generation;
}

export function cancelPendingPlayback(
  root: HTMLElement,
  session: PlaybackSession,
): void {
  if (session.playbackTimeoutId === null) {
    return;
  }
  root.ownerDocument.defaultView?.clearTimeout(session.playbackTimeoutId);
  session.playbackTimeoutId = null;
}

export function setMediaState(root: HTMLElement, state: MediaState): void {
  root.dataset.mediaState = state;
  const play = root.querySelector<HTMLButtonElement>(PLAY_SELECTOR);
  const pause = root.querySelector<HTMLButtonElement>(PAUSE_SELECTOR);
  if (play) {
    play.disabled = state === "loading" || state === "playing";
  }
  if (pause) {
    pause.disabled = state !== "loading" && state !== "playing";
  }
}

export function setStatus(root: HTMLElement, message = ""): void {
  const status = root.querySelector<HTMLElement>(STATUS_SELECTOR);
  if (status) {
    status.textContent = message;
  }
}

export function handlePlayFailure(
  root: HTMLElement,
  media: HTMLVideoElement,
  session: PlaybackSession,
  error: unknown,
): void {
  if (
    session.phase !== "active" ||
    session.autoPlayback === "failed" ||
    session.autoPlayback === "completed"
  ) {
    return;
  }
  cancelPendingPlayback(root, session);
  session.autoPlayback = "failed";
  session.generation += 1;
  releaseMedia(media);
  setMediaState(root, "error");
  setStatus(root, root.dataset.mediaErrorLabel ?? "Media playback failed.");
  root.dispatchEvent(
    new CustomEvent("gorilla:media-play-failed", {
      detail: {
        message: error instanceof Error ? error.message : "Playback failed.",
      },
    }),
  );
}

export function startPlayback(
  root: HTMLElement,
  media: HTMLVideoElement,
  session: PlaybackSession,
): void {
  cancelPendingPlayback(root, session);
  const generation = ++session.generation;
  setMediaState(root, "loading");
  exposeMedia(media);
  session.playbackTimeoutId =
    root.ownerDocument.defaultView?.setTimeout((): void => {
      if (isCurrent(session, generation)) {
        handlePlayFailure(
          root,
          media,
          session,
          new Error("Media playback start timed out."),
        );
      }
    }, MEDIA_PLAYBACK_TIMEOUT_MS) ?? null;
  media
    .play()
    .then((): void => {
      if (isCurrent(session, generation) && !media.paused) {
        cancelPendingPlayback(root, session);
        setMediaState(root, "playing");
      }
    })
    .catch((error: unknown): void => {
      if (isCurrent(session, generation)) {
        handlePlayFailure(root, media, session, error);
      }
    });
}

export function pauseMedia(
  root: HTMLElement,
  media: HTMLVideoElement,
  session: PlaybackSession,
  outcome: PauseOutcome = "paused",
): void {
  cancelPendingPlayback(root, session);
  session.generation += 1;
  releaseMedia(media);
  if (root.dataset.mediaState !== "error") {
    setMediaState(root, outcome);
  }
}

export function completePlayback(
  root: HTMLElement,
  media: HTMLVideoElement,
  session: PlaybackSession,
): void {
  cancelPendingPlayback(root, session);
  session.autoPlayback = "completed";
  session.generation += 1;
  releaseMedia(media);
  setMediaState(root, "ended");
  setStatus(root);
}
