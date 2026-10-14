import { z } from "zod";

const COMPUTED_STATE_SCHEMA = z.object({
  source: z.literal("computed"),
  actionVisibility: z.array(z.string()).min(1),
  copyOpacity: z.string(),
  copyVisibility: z.string(),
  headingVisibility: z.string(),
  phase: z.string(),
});
const INLINE_HISTORY_SCHEMA = z.object({
  source: z.literal("previous-inline"),
  oldOpacity: z.string(),
  oldVisibility: z.string(),
  newOpacity: z.string(),
  newVisibility: z.string(),
  oldStyle: z.string(),
  newStyle: z.string(),
  phase: z.literal("mutation-history"),
});
export const SEMANTIC_COPY_PROBE_SCHEMA = z
  .array(
    z.discriminatedUnion("source", [
      COMPUTED_STATE_SCHEMA,
      INLINE_HISTORY_SCHEMA,
    ]),
  )
  .min(2);

interface CopyProbeOptions {
  readonly copySelector: string;
  readonly maximumStates: number;
  readonly probeAttribute: string;
  readonly worldSelector: string;
}

/** Self-contained browser init closure; helpers cannot import into page scope. */
export function observeSemanticCopy(options: CopyProbeOptions): void {
  const states: unknown[] = [];
  let previousInputs = "";
  const publish = (state: unknown): void => {
    if (states.length >= options.maximumStates) return;
    states.push(state);
    document.documentElement.setAttribute(
      options.probeAttribute,
      JSON.stringify(states),
    );
  };
  const semanticAncestors = (copy: HTMLElement): HTMLElement[] => {
    const ancestors: HTMLElement[] = [];
    let ancestor = copy.parentElement;
    while (ancestor !== null) {
      ancestors.push(ancestor);
      ancestor = ancestor.parentElement;
    }
    return ancestors;
  };
  const recordHistory = (mutation: MutationRecord): void => {
    if (
      mutation.attributeName !== "style" ||
      mutation.oldValue === null ||
      !(mutation.target instanceof HTMLElement)
    )
      return;
    const previous = document.createElement("span").style;
    previous.cssText = mutation.oldValue;
    const current = mutation.target.style;
    if (
      previous.opacity === current.opacity &&
      previous.visibility === current.visibility
    )
      return;
    publish({
      source: "previous-inline",
      phase: "mutation-history",
      oldOpacity: previous.opacity,
      oldVisibility: previous.visibility,
      newOpacity: current.opacity,
      newVisibility: current.visibility,
      oldStyle: mutation.oldValue,
      newStyle: mutation.target.getAttribute("style") ?? "",
    });
  };
  const recordComputed = (
    copy: HTMLElement,
    heading: HTMLElement,
    world: HTMLElement,
    targets: readonly HTMLElement[],
  ): void => {
    const inputs = JSON.stringify([
      world.dataset.motionReady,
      world.dataset.worldEntranceReady,
      ...targets.map((target) => [
        target.className,
        target.style.opacity,
        target.style.visibility,
        target.getAttribute("data-motion-tier"),
        target.getAttribute("hidden"),
        target.getAttribute("inert"),
      ]),
    ]);
    if (inputs === previousInputs) return;
    previousInputs = inputs;
    publish({
      source: "computed",
      actionVisibility: [...copy.querySelectorAll("a[href], button")].map(
        (action) => getComputedStyle(action).visibility,
      ),
      copyOpacity: getComputedStyle(copy).opacity,
      copyVisibility: getComputedStyle(copy).visibility,
      headingVisibility: getComputedStyle(heading).visibility,
      phase: world.dataset.worldEntranceReady ?? "mounted",
    });
  };
  const observer = new MutationObserver((mutations) => {
    const copy = document.querySelector(options.copySelector);
    const heading = copy?.querySelector("h1");
    const world = document.querySelector(options.worldSelector);
    if (
      !(copy instanceof HTMLElement) ||
      !(heading instanceof HTMLElement) ||
      !(world instanceof HTMLElement)
    )
      return;
    const targets = [
      copy,
      heading,
      ...semanticAncestors(copy),
      ...[...copy.querySelectorAll("a[href], button")].filter(
        (action) => action instanceof HTMLElement,
      ),
    ];
    const relevant = mutations.filter(
      (mutation) =>
        mutation.type === "childList" ||
        targets.some((target) => target === mutation.target),
    );
    if (relevant.length === 0) return;
    for (const mutation of relevant) recordHistory(mutation);
    recordComputed(copy, heading, world, targets);
  });
  observer.observe(document, {
    attributeFilter: [
      "style",
      "class",
      "hidden",
      "inert",
      "data-motion-ready",
      "data-motion-tier",
      "data-world-entrance-ready",
    ],
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true,
  });
  window.addEventListener("pagehide", () => observer.disconnect(), {
    once: true,
  });
}
