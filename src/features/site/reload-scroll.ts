const ASTRO_HISTORY_SCROLL_FIELD = "scrollY";
export const ROUTE_HISTORY_SCROLL_FIELD = "gorillaScrollY";
export const RELOAD_SCROLL_STORAGE_KEY = "gorilla:reload-scroll:v1";
const MAXIMUM_HANDOFF_CHARACTERS = 2_048;

function readPosition(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

/** Capture reload state once; traversal must keep its independently preserved route state. */
export function readInitialReloadScroll(options: {
  readonly navigationType: unknown;
  readonly historyState: unknown;
  readonly handoffPosition?: unknown;
}): number | null {
  if (options.navigationType !== "reload") return null;
  const handoff = readPosition(options.handoffPosition);
  if (handoff !== null) return handoff;
  const state = options.historyState;
  if (typeof state !== "object" || state === null || Array.isArray(state))
    return null;
  const legacy: unknown = Reflect.get(state, ROUTE_HISTORY_SCROLL_FIELD);
  const router: unknown = Reflect.get(state, ASTRO_HISTORY_SCROLL_FIELD);
  return readPosition(legacy) ?? readPosition(router);
}

type ReloadHandoff =
  | { kind: "captured"; position: number }
  | { kind: "absent" }
  | {
      kind: "discarded";
      reason: "invalid-json" | "invalid-record" | "different-route";
    };

/** Validate the one-use same-route handoff without accepting arbitrary storage content. */
export function parseReloadScrollHandoff(options: {
  serialized: unknown;
  path: string;
}): ReloadHandoff {
  if (options.serialized === null || options.serialized === undefined)
    return { kind: "absent" };
  if (
    typeof options.serialized !== "string" ||
    options.serialized.length > MAXIMUM_HANDOFF_CHARACTERS
  )
    return { kind: "discarded", reason: "invalid-record" };
  let decoded: unknown;
  try {
    decoded = JSON.parse(options.serialized);
  } catch (error: unknown) {
    if (error instanceof SyntaxError)
      return { kind: "discarded", reason: "invalid-json" };
    throw error;
  }
  if (typeof decoded !== "object" || decoded === null || Array.isArray(decoded))
    return { kind: "discarded", reason: "invalid-record" };
  const path: unknown = Reflect.get(decoded, "path");
  const position = readPosition(Reflect.get(decoded, "position"));
  if (typeof path !== "string" || position === null)
    return { kind: "discarded", reason: "invalid-record" };
  if (path !== options.path)
    return { kind: "discarded", reason: "different-route" };
  return { kind: "captured", position };
}
