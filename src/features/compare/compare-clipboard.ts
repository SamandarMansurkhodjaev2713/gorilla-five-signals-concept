import { createShareUrl } from "./compare-state";

export function recordCopyFailure(root: HTMLElement, error: unknown): void {
  root.dataset.compareCopyError =
    error instanceof Error ? "clipboard-rejected" : "clipboard-unavailable";
}

export async function copyCompareSelection(options: {
  readonly clipboard: Clipboard | undefined;
  readonly locationHref: string;
  readonly root: HTMLElement;
  readonly selection: readonly string[];
}): Promise<void> {
  if (options.clipboard === undefined) {
    throw new Error("The Clipboard API is unavailable.");
  }
  const shareUrl = createShareUrl(options.locationHref, options.selection).href;

  try {
    await options.clipboard.writeText(shareUrl);
  } catch (error: unknown) {
    recordCopyFailure(options.root, error);
    throw new Error("The comparison URL could not be copied.", {
      cause: error,
    });
  }
}
