import type { Page } from "@playwright/test";

interface EntranceObservation {
  created: number;
  started: number;
  finished: number;
  cancelled: number;
}

declare global {
  interface Window {
    __nativeEntranceObservation?: Record<string, EntranceObservation>;
  }
}

/** Observe genuine native objects without pausing, seeking or replacing their effects. */
export async function installNativeEntranceObserver(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const observations: Record<string, EntranceObservation> = {};
    window.__nativeEntranceObservation = observations;
    const NativeAnimation = window.Animation;
    window.Animation = class extends NativeAnimation {
      constructor(
        effect?: AnimationEffect | null,
        timeline?: AnimationTimeline | null,
      ) {
        super(effect, timeline);
        // The application assigns the scoped ID and starts the native object
        // synchronously after construction, before this microtask is delivered.
        queueMicrotask(() => {
          const prefix = [
            "gorilla-manifesto:",
            "gorilla-material-film:",
            "gorilla-terminal:",
          ].find((value) => this.id.startsWith(value));
          if (prefix === undefined) return;
          const state = observations[prefix] ?? {
            created: 0,
            started: 0,
            finished: 0,
            cancelled: 0,
          };
          observations[prefix] = state;
          state.created += 1;
          if (
            typeof this.startTime === "number" &&
            Number.isFinite(this.startTime) &&
            (this.playState === "running" || this.playState === "finished")
          )
            state.started += 1;
          this.addEventListener(
            "finish",
            () => {
              state.finished += 1;
            },
            { once: true },
          );
          this.addEventListener(
            "cancel",
            () => {
              state.cancelled += 1;
            },
            { once: true },
          );
        });
      }
    };
  });
}

export async function readNativeEntranceObservation(
  page: Page,
  prefix: string,
): Promise<EntranceObservation> {
  return page.evaluate(
    (value) =>
      window.__nativeEntranceObservation?.[value] ?? {
        created: 0,
        started: 0,
        finished: 0,
        cancelled: 0,
      },
    prefix,
  );
}
