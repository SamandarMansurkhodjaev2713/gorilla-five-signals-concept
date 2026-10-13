import { createShareUrl, selectionFromUrl } from "./compare-state";

function isHistoryRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export interface CompareLocationStore {
  read(
    limit: number,
    canonicalize: "canonicalize" | "preserve",
  ): readonly string[];
  write(selection: readonly string[]): void;
}

export function createCompareLocationStore(options: {
  readonly defaults: readonly string[];
  readonly validSlugs: ReadonlySet<string>;
  readonly windowValue: Window;
}): CompareLocationStore {
  const write = (selection: readonly string[]): void => {
    const shareUrl = createShareUrl(
      options.windowValue.location.href,
      selection,
    );
    const currentState: unknown = options.windowValue.history.state;
    options.windowValue.history.replaceState(
      {
        ...(isHistoryRecord(currentState) ? currentState : {}),
        products: selection,
      },
      "",
      shareUrl,
    );
  };

  return {
    read: (limit, canonicalize): readonly string[] => {
      const url = new URL(options.windowValue.location.href);
      const selection = selectionFromUrl(
        url,
        options.defaults,
        options.validSlugs,
        limit,
      );
      if (
        canonicalize === "canonicalize" &&
        createShareUrl(url, selection).href !== url.href
      ) {
        write(selection);
      }
      return selection;
    },
    write,
  };
}
