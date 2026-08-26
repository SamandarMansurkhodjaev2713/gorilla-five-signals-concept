import { publishMotionDiagnostic } from "./diagnostics";
import type { UserMotionPreference } from "./capability-policy";

const STORAGE_KEY = "gorilla:motion-preference:v1";
const PREFERENCE_VALUES = ["system", "full", "lite", "reduced"] as const;
const PREFERENCE_SELECTOR = "[data-motion-preference]";
const CURRENT_SELECTOR = "[data-motion-current]";
const TOGGLE_SELECTOR = "[data-motion-toggle]";

export const MOTION_PREFERENCE_EVENT = "gorilla:motion-preference";

export interface MotionPreferenceController {
  current(): UserMotionPreference;
  destroy(): void;
}

interface PreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function isPreference(value: string | null): value is UserMotionPreference {
  return (
    value !== null &&
    PREFERENCE_VALUES.some((preference) => preference === value)
  );
}

function readStoredPreference(
  storage: PreferenceStorage,
  windowValue: Window,
): UserMotionPreference {
  try {
    const value = storage.getItem(STORAGE_KEY);
    return isPreference(value) ? value : "system";
  } catch (error: unknown) {
    publishMotionDiagnostic(windowValue, {
      code: "preference-storage-failed",
      message: error instanceof Error ? error.message : "Storage read failed.",
    });
    return "system";
  }
}

function persistPreference(
  storage: PreferenceStorage,
  preference: UserMotionPreference,
  windowValue: Window,
): void {
  try {
    storage.setItem(STORAGE_KEY, preference);
  } catch (error: unknown) {
    publishMotionDiagnostic(windowValue, {
      code: "preference-storage-failed",
      message: error instanceof Error ? error.message : "Storage write failed.",
    });
  }
}

function createMemoryStorage(): PreferenceStorage {
  const values = new Map<string, string>();

  return {
    getItem: (key): string | null => values.get(key) ?? null,
    setItem: (key, value): void => {
      values.set(key, value);
    },
  };
}

function resolveStorage(
  windowValue: Window,
  provided: PreferenceStorage | undefined,
): PreferenceStorage {
  if (provided) {
    return provided;
  }

  try {
    return windowValue.localStorage;
  } catch (error: unknown) {
    publishMotionDiagnostic(windowValue, {
      code: "preference-storage-failed",
      message:
        error instanceof Error ? error.message : "Storage access failed.",
    });
    return createMemoryStorage();
  }
}

function updateControls(
  documentValue: Document,
  preference: UserMotionPreference,
): void {
  for (const control of documentValue.querySelectorAll<HTMLElement>(
    PREFERENCE_SELECTOR,
  )) {
    const selected = control.dataset.motionPreference === preference;
    control.setAttribute("aria-pressed", String(selected));
  }

  for (const toggle of documentValue.querySelectorAll<HTMLElement>(
    TOGGLE_SELECTOR,
  )) {
    const paused = preference === "reduced";
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.dataset.motionPaused = String(paused);
    const label = paused
      ? toggle.dataset.motionResumeLabel
      : toggle.dataset.motionPauseLabel;
    if (label !== undefined) {
      toggle.textContent = label;
    }
  }

  for (const current of documentValue.querySelectorAll<HTMLElement>(
    CURRENT_SELECTOR,
  )) {
    const labelKey = `motionLabel${preference[0]?.toUpperCase() ?? ""}${preference.slice(1)}`;
    const label = current.dataset[labelKey];
    if (label !== undefined) {
      current.textContent = label;
    }
  }

  documentValue.documentElement.dataset.motionPreference = preference;
}

export function createMotionPreferenceController(options: {
  readonly documentValue: Document;
  readonly windowValue: Window;
  readonly storage?: PreferenceStorage;
  readonly onChange: (preference: UserMotionPreference) => void;
}): MotionPreferenceController {
  const storage = resolveStorage(options.windowValue, options.storage);
  let preference = readStoredPreference(storage, options.windowValue);

  const commit = (next: UserMotionPreference): void => {
    if (next === preference) {
      return;
    }

    preference = next;
    persistPreference(storage, next, options.windowValue);
    updateControls(options.documentValue, next);
    options.windowValue.dispatchEvent(
      new CustomEvent<UserMotionPreference>(MOTION_PREFERENCE_EVENT, {
        detail: next,
      }),
    );
    options.onChange(next);
  };

  const controls = Array.from(
    options.documentValue.querySelectorAll<HTMLElement>(
      `${PREFERENCE_SELECTOR}, ${TOGGLE_SELECTOR}`,
    ),
  );
  const handleClick = (event: Event): void => {
    if (!(event.currentTarget instanceof HTMLElement)) {
      return;
    }

    const explicitPreference =
      event.currentTarget.dataset.motionPreference ?? null;

    if (isPreference(explicitPreference)) {
      commit(explicitPreference);
      return;
    }

    if (event.currentTarget.matches(TOGGLE_SELECTOR)) {
      commit(preference === "reduced" ? "system" : "reduced");
    }
  };

  for (const control of controls) {
    control.addEventListener("click", handleClick);
  }
  updateControls(options.documentValue, preference);

  return {
    current: (): UserMotionPreference => preference,
    destroy: (): void => {
      for (const control of controls) {
        control.removeEventListener("click", handleClick);
      }
    },
  };
}
