function preserveSource(source: HTMLSourceElement): void {
  const currentSource = source.getAttribute("src");
  if (currentSource !== null) {
    source.dataset.motionSource = currentSource;
  }
}

export function restoreMediaSources(media: HTMLVideoElement): void {
  media.querySelectorAll("source").forEach((source): void => {
    preserveSource(source);
    if (!source.hasAttribute("src") && source.dataset.motionSource) {
      source.setAttribute("src", source.dataset.motionSource);
    }
  });
}

export function exposeMedia(media: HTMLVideoElement): void {
  restoreMediaSources(media);
  media.hidden = false;
  if (media.readyState === HTMLMediaElement.HAVE_NOTHING) {
    media.load();
  }
}

export function hideMediaAtStart(media: HTMLVideoElement): void {
  media.pause();
  media.currentTime = 0;
  media.hidden = true;
}

export function releaseMedia(media: HTMLVideoElement): void {
  media.pause();
  media.hidden = true;
  media.querySelectorAll("source").forEach((source): void => {
    preserveSource(source);
    source.removeAttribute("src");
  });
  media.removeAttribute("src");
  media.load();
}
