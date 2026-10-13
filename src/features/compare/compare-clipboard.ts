import { createShareUrl } from "./compare-state";

export interface CompareCopyStatusTarget {
  readonly dataset: Record<string, string | undefined>;
}

export function recordCopyFailure(
  root: CompareCopyStatusTarget,
  error: unknown,
): void {
  root.dataset.compareCopyError =
    error instanceof Error ? "clipboard-rejected" : "clipboard-unavailable";
}

export async function copyCompareSelection(options: {
  readonly clipboard: Pick<Clipboard, "writeText"> | undefined;
  readonly locationHref: string;
  readonly selection: readonly string[];
}): Promise<void> {
  if (options.clipboard === undefined) {
    throw new Error("The Clipboard API is unavailable.");
  }
  const shareUrl = createShareUrl(options.locationHref, options.selection).href;

  try {
    await options.clipboard.writeText(shareUrl);
  } catch (error: unknown) {
    throw new Error("The comparison URL could not be copied.", {
      cause: error,
    });
  }
}
