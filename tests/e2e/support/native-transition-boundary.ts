import type { Page } from "@playwright/test";

import type {
  NativeBoundaryEvidence,
  NativeReadyPhase,
} from "./native-boundary-contract";

interface NativeTransitionRecord {
  readonly transition: ViewTransition;
  ready: NativeReadyPhase;
  ownedSkips: number;
}

interface NativeBoundaryState {
  readonly transitions: NativeTransitionRecord[];
  readonly outcomes: unknown[];
  readonly unhandled: string[];
  contactIntents: number;
}

declare global {
  interface Window {
    __nativeBoundaryState?: NativeBoundaryState;
  }
}

function installBoundaryProbe(contactSelector: string): void {
  sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
  localStorage.setItem("gorilla:motion-preference:v1", "full");
  const state: NativeBoundaryState = {
    transitions: [],
    outcomes: [],
    unhandled: [],
    contactIntents: 0,
  };
  window.__nativeBoundaryState = state;
  document.addEventListener("astro:transition-outcome", (event) => {
    if (!(event instanceof CustomEvent))
      throw new Error("Expected a structured native transition outcome.");
    const detail: unknown = event.detail;
    state.outcomes.push(detail);
  });
  window.addEventListener("unhandledrejection", (event) => {
    const owner = state.transitions.findIndex(
      (record) => record.transition.ready === event.promise,
    );
    state.unhandled.push(
      owner === -1 ? "other-promise" : `native-ready-${String(owner)}`,
    );
  });
  const nativeStart = document.startViewTransition.bind(document);
  document.startViewTransition = (...args) => {
    const transition = nativeStart(...args);
    const record: NativeTransitionRecord = {
      transition,
      ready: { kind: "pending" },
      ownedSkips: 0,
    };
    state.transitions.push(record);
    observeReadiness(record);
    const nativeSkip = transition.skipTransition.bind(transition);
    transition.skipTransition = () => {
      nativeSkip();
      record.ownedSkips += 1;
    };
    if (state.transitions.length === 1) queueMicrotask(dispatchContactIntent);
    return transition;
  };

  function observeReadiness(record: NativeTransitionRecord): void {
    const observation = record.transition.ready.then(
      () => {
        record.ready = { kind: "fulfilled" };
      },
      (reason: unknown) => {
        record.ready = {
          kind: "rejected",
          reason:
            reason instanceof DOMException && reason.name === "AbortError"
              ? "native-abort"
              : "unexpected",
        };
      },
    );
    void observation.catch((error: unknown) => {
      queueMicrotask(() => {
        throw error;
      });
    });
  }

  function dispatchContactIntent(): void {
    const contact = document.querySelector(contactSelector);
    if (!(contact instanceof HTMLAnchorElement))
      throw new Error("The real Contact route intent target is unavailable.");
    state.contactIntents += 1;
    contact.click();
  }
}

/** Keep native identity/callbacks; the phase validator must detect missing owners. */
export async function installNativeBoundaryNavigation(
  page: Page,
): Promise<void> {
  await page.addInitScript(
    installBoundaryProbe,
    '.desktop-navigation a[href="/uz/contact/"]',
  );
}

export async function readNativeBoundaryEvidence(
  page: Page,
): Promise<NativeBoundaryEvidence> {
  return page.evaluate((): NativeBoundaryEvidence => {
    const state = window.__nativeBoundaryState;
    if (state === undefined)
      throw new Error("Native transition boundary evidence is missing.");
    return {
      contactIntents: state.contactIntents,
      nativeTransitions: state.transitions.length,
      firstReady: state.transitions[0]?.ready ?? { kind: "pending" },
      finalReady: state.transitions.at(-1)?.ready ?? { kind: "pending" },
      firstOwnedSkips: state.transitions[0]?.ownedSkips ?? 0,
      outcomes: state.outcomes,
      unhandled: state.unhandled,
    };
  });
}
