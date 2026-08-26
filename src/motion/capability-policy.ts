import type { MotionCapability } from "./scene-contract";

export type UserMotionPreference = "system" | "full" | "lite" | "reduced";

export interface MotionEnvironment {
  readonly systemReduced: boolean;
  readonly coarsePointer: boolean;
  readonly saveData: boolean;
  readonly userPreference: UserMotionPreference;
}

export interface CapabilityController {
  current(): MotionCapability;
  refresh(): void;
  destroy(): void;
}

export interface MotionMediaQuery {
  readonly matches: boolean;
  addEventListener(
    type: "change",
    listener: () => void,
    options: AddEventListenerOptions,
  ): void;
}

export interface MotionWindow {
  matchMedia(query: string): MotionMediaQuery;
}

export interface MotionNavigator {
  readonly userAgent: string;
  readonly connection?: unknown;
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const COARSE_POINTER_QUERY = "(pointer: coarse)";

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === "object" && value !== null;
}

function readSaveData(navigatorValue: MotionNavigator): boolean {
  const connection = navigatorValue.connection;

  if (!isRecord(connection)) {
    return false;
  }

  return connection.saveData === true;
}

export function resolveMotionCapability(
  environment: MotionEnvironment,
): MotionCapability {
  if (environment.userPreference === "reduced") {
    return { kind: "reduced", reason: "user-disabled" };
  }

  if (environment.userPreference === "lite") {
    return { kind: "lite", reason: "user-selected" };
  }

  if (environment.userPreference === "full") {
    return { kind: "full", reason: "user-enabled" };
  }

  if (environment.systemReduced) {
    return { kind: "reduced", reason: "system-preference" };
  }

  if (environment.saveData) {
    return { kind: "lite", reason: "data-saver" };
  }

  if (environment.coarsePointer) {
    return { kind: "lite", reason: "touch" };
  }

  return { kind: "full", reason: "capable-fine-pointer" };
}

export function observeMotionCapability(options: {
  readonly userPreference: () => UserMotionPreference;
  readonly onChange: (capability: MotionCapability) => void;
  readonly windowValue?: MotionWindow;
  readonly navigatorValue?: MotionNavigator;
}): CapabilityController {
  const windowValue = options.windowValue ?? window;
  const navigatorValue = options.navigatorValue ?? navigator;
  const reducedQuery = windowValue.matchMedia(REDUCED_QUERY);
  const pointerQuery = windowValue.matchMedia(COARSE_POINTER_QUERY);
  const controller = new AbortController();

  const read = (): MotionCapability =>
    resolveMotionCapability({
      systemReduced: reducedQuery.matches,
      coarsePointer: pointerQuery.matches,
      saveData: readSaveData(navigatorValue),
      userPreference: options.userPreference(),
    });

  let previous = read();

  const publishIfChanged = (): void => {
    const next = read();

    if (next.kind === previous.kind && next.reason === previous.reason) {
      return;
    }

    previous = next;
    options.onChange(next);
  };

  reducedQuery.addEventListener("change", publishIfChanged, {
    signal: controller.signal,
  });
  pointerQuery.addEventListener("change", publishIfChanged, {
    signal: controller.signal,
  });

  return {
    current: read,
    refresh: publishIfChanged,
    destroy: (): void => {
      controller.abort();
    },
  };
}
