import type { CompareElements } from "./compare-contract";

const FULL_MOTION_TIER = "full";
const MOTION_TIER_ATTRIBUTE = "data-motion-tier";
const FIELD_CUE_DURATION_MS = 1_050;

export interface CompareFieldCue {
  destroy(): void;
  trigger(): void;
}

export function createCompareFieldCue(options: {
  readonly elements: CompareElements;
  readonly signal: AbortSignal;
  readonly windowValue: Window;
}): CompareFieldCue {
  const documentElement = options.elements.root.ownerDocument.documentElement;
  let pendingInitialCue = false;
  let timeoutId: number | undefined;

  const cancel = (): void => {
    if (timeoutId !== undefined) {
      options.windowValue.clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    delete options.elements.field.dataset.fieldCue;
  };

  const trigger = (): void => {
    cancel();
    const tier = documentElement.dataset.motionTier;
    if (tier === undefined) {
      pendingInitialCue = true;
      return;
    }
    pendingInitialCue = false;
    if (tier !== FULL_MOTION_TIER || options.signal.aborted) {
      return;
    }

    // Reading layout between removal and activation guarantees that a rapid
    // selection starts a fresh causal cue instead of inheriting an old frame.
    void options.elements.field.offsetWidth;
    options.elements.field.dataset.fieldCue = "active";
    timeoutId = options.windowValue.setTimeout(cancel, FIELD_CUE_DURATION_MS);
  };

  const motionObserver = new MutationObserver((): void => {
    const tier = documentElement.dataset.motionTier;
    if (tier === FULL_MOTION_TIER && pendingInitialCue) {
      trigger();
      return;
    }
    if (tier !== FULL_MOTION_TIER) {
      pendingInitialCue = false;
      cancel();
    }
  });
  motionObserver.observe(documentElement, {
    attributeFilter: [MOTION_TIER_ATTRIBUTE],
  });

  const destroy = (): void => {
    pendingInitialCue = false;
    cancel();
    motionObserver.disconnect();
  };
  options.signal.addEventListener("abort", destroy, { once: true });

  return { destroy, trigger };
}
