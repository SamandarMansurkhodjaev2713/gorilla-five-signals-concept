interface ScrollRestorationPort {
  currentY(): number;
  writeY(position: number): void;
  requestFrame(callback: FrameRequestCallback): number;
  cancelFrame(handle: number): void;
}

interface ScrollRestorationOptions {
  readonly port: ScrollRestorationPort;
  readonly maximumFrames: number;
  readonly stableFrames: number;
  readonly tolerancePx: number;
}

function validateOptions(options: ScrollRestorationOptions): void {
  if (
    !Number.isSafeInteger(options.maximumFrames) ||
    options.maximumFrames < 1 ||
    !Number.isSafeInteger(options.stableFrames) ||
    options.stableFrames < 1 ||
    options.stableFrames > options.maximumFrames ||
    !Number.isFinite(options.tolerancePx) ||
    options.tolerancePx < 0
  )
    throw new RangeError(
      "Scroll restoration requires a finite bounded frame policy.",
    );
}

/** Own one bounded restoration; newer requests or explicit cancellation invalidate old frames. */
export function createScrollRestoration(options: ScrollRestorationOptions) {
  validateOptions(options);
  let generation = 0;
  let frame: number | null = null;
  const cancel = (): void => {
    generation += 1;
    if (frame !== null) options.port.cancelFrame(frame);
    frame = null;
  };
  const restore = (position: number): void => {
    cancel();
    if (!Number.isFinite(position) || position < 0)
      throw new RangeError(
        "Scroll restoration requires a nonnegative finite coordinate.",
      );
    const activeGeneration = generation;
    let framesRemaining = options.maximumFrames;
    let stableFrames = 0;
    const step = (): void => {
      if (activeGeneration !== generation) return;
      frame = null;
      if (Math.abs(options.port.currentY() - position) > options.tolerancePx) {
        stableFrames = 0;
        options.port.writeY(position);
      } else stableFrames += 1;
      framesRemaining -= 1;
      if (framesRemaining > 0 && stableFrames < options.stableFrames)
        frame = options.port.requestFrame(step);
    };
    frame = options.port.requestFrame(step);
  };
  return { restore, cancel };
}
