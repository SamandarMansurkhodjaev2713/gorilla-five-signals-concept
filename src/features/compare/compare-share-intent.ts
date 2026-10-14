import {
  copyCompareSelection,
  recordCopyFailure,
  type CompareCopyStatusTarget,
} from "./compare-clipboard";

export interface CompareShareIntent {
  copy(selection: readonly string[]): Promise<void>;
}

export function createCompareShareIntent(options: {
  readonly announceCopied: () => void;
  readonly announceFailed: () => void;
  readonly clipboard: Pick<Clipboard, "writeText"> | undefined;
  readonly locationHref: () => string;
  readonly root: CompareCopyStatusTarget;
  readonly signal: AbortSignal;
}): CompareShareIntent {
  let generation = 0;

  const isCurrent = (intentGeneration: number): boolean =>
    !options.signal.aborted && intentGeneration === generation;

  options.signal.addEventListener(
    "abort",
    (): void => {
      generation += 1;
    },
    { once: true },
  );

  return {
    copy: async (selection): Promise<void> => {
      const intentGeneration = ++generation;
      try {
        await copyCompareSelection({
          clipboard: options.clipboard,
          locationHref: options.locationHref(),
          selection,
        });
        if (!isCurrent(intentGeneration)) {
          return;
        }
        delete options.root.dataset.compareCopyError;
        options.announceCopied();
      } catch (error: unknown) {
        if (!isCurrent(intentGeneration)) {
          return;
        }
        recordCopyFailure(options.root, error);
        options.announceFailed();
      }
    },
  };
}
