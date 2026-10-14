import { describe, expect, it, vi } from "vitest";

import {
  copyCompareSelection,
  recordCopyFailure,
} from "@/features/compare/compare-clipboard";
import { createCompareShareIntent } from "@/features/compare/compare-share-intent";

function createStatusTarget(): {
  readonly dataset: Record<string, string | undefined>;
} {
  return { dataset: {} };
}

describe("compare clipboard boundary", () => {
  it("GIVEN a writable clipboard WHEN selection is copied THEN its canonical URL preserves unrelated state", async () => {
    const writeText = vi
      .fn<(value: string) => Promise<void>>()
      .mockResolvedValue();

    await copyCompareSelection({
      clipboard: { writeText },
      locationHref:
        "https://example.test/uz/compare/?campaign=signal#comparison",
      selection: ["original", "zero"],
    });

    expect(writeText).toHaveBeenCalledWith(
      "https://example.test/uz/compare/?campaign=signal&products=original%2Czero#comparison",
    );
  });

  it("GIVEN clipboard rejection WHEN copy is attempted THEN the boundary returns an explicit failure", async () => {
    const clipboard = {
      writeText: vi
        .fn<() => Promise<void>>()
        .mockRejectedValue(
          new DOMException("Permission denied", "NotAllowedError"),
        ),
    };

    await expect(
      copyCompareSelection({
        clipboard,
        locationHref: "https://example.test/en/compare/",
        selection: ["extra"],
      }),
    ).rejects.toThrow("could not be copied");
  });

  it("GIVEN an unavailable clipboard WHEN failure is recorded THEN the state distinguishes the boundary", () => {
    const root = createStatusTarget();

    recordCopyFailure(root, "unavailable");

    expect(root.dataset.compareCopyError).toBe("clipboard-unavailable");
  });

  it("GIVEN a delayed clipboard rejection WHEN its session is destroyed and remounted THEN the retired root stays untouched", async () => {
    let rejectWrite: ((reason: unknown) => void) | undefined;
    const delayedWrite = new Promise<void>((_resolve, reject) => {
      rejectWrite = reject;
    });
    const retiredRoot = createStatusTarget();
    const activeRoot = createStatusTarget();
    const retiredAbort = new AbortController();
    const activeAbort = new AbortController();
    const retiredCopied = vi.fn();
    const retiredFailed = vi.fn();
    const activeCopied = vi.fn();

    const retiredIntent = createCompareShareIntent({
      announceCopied: retiredCopied,
      announceFailed: retiredFailed,
      clipboard: { writeText: vi.fn(() => delayedWrite) },
      locationHref: () => "https://example.test/en/compare/",
      root: retiredRoot,
      signal: retiredAbort.signal,
    });
    const retiredCopy = retiredIntent.copy(["original"]);
    retiredAbort.abort();

    const activeIntent = createCompareShareIntent({
      announceCopied: activeCopied,
      announceFailed: vi.fn(),
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      locationHref: () => "https://example.test/en/compare/",
      root: activeRoot,
      signal: activeAbort.signal,
    });
    await activeIntent.copy(["extra"]);

    rejectWrite?.(new DOMException("Permission denied", "NotAllowedError"));
    await retiredCopy;

    expect(retiredRoot.dataset).toEqual({});
    expect(retiredCopied).not.toHaveBeenCalled();
    expect(retiredFailed).not.toHaveBeenCalled();
    expect(activeRoot.dataset).toEqual({});
    expect(activeCopied).toHaveBeenCalledOnce();
  });
});
