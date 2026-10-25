import { describe, expect, it, vi } from "vitest";

import { REACTOR_MOTION_SELECTOR } from "@/features/flavor-reactor/flavor-reactor-presentation";
import { createNativeReactorPlayer } from "@/features/flavor-reactor/native/create-native-reactor";

import type { ReactorContext } from "@/features/flavor-reactor/flavor-reactor-presentation";

type ApiMode =
  "complete" | "missing-animation" | "missing-effect" | "missing-matrix";
type CssMode = "missing" | "supported" | "unsupported";
type MatrixMode = "identity" | "singular" | "three-dimensional";
type ProbeMode =
  "clone-type-error" | "success" | "type-error" | "unknown-error";

interface HarnessOptions {
  readonly api?: ApiMode;
  readonly computedStyleError?: Error;
  readonly css?: CssMode;
  readonly defaultView?: "active" | "null";
  readonly importantProperty?: string;
  readonly matrix?: MatrixMode;
  readonly probe?: ProbeMode;
  readonly style?: Partial<StylePort>;
}

interface StylePort {
  readonly clipPath: string;
  readonly opacity: string;
  readonly rotate: string;
  readonly scale: string;
  readonly transform: string;
  readonly translate: string;
  readonly visibility: string;
}

interface Harness {
  readonly animationConstructions: { count: number };
  readonly context: ReactorContext;
  readonly effectTargets: unknown[];
  readonly incoming: HTMLElement;
  readonly operations: string[];
  readonly outgoing: HTMLElement;
}

const DEFAULT_STYLE: StylePort = {
  clipPath: "none",
  opacity: "1",
  rotate: "none",
  scale: "none",
  transform: "none",
  translate: "none",
  visibility: "visible",
};

function asElement(port: object): HTMLElement {
  // TYPE-EXCEPTION: These focused ports expose only element identity, queries,
  // geometry and inline priority surfaces consumed by the native read boundary.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return port as HTMLElement;
}

function asWindow(port: object): Window & typeof globalThis {
  // TYPE-EXCEPTION: The test port implements only the explicitly exercised
  // browser constructors, CSS support and computed-style APIs.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return port as Window & typeof globalThis;
}

function asDocument(port: object): Document {
  // TYPE-EXCEPTION: The native factory consumes only defaultView and timeline
  // from this focused document port.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return port as Document;
}

function asContext(port: object): ReactorContext {
  // TYPE-EXCEPTION: The native factory consumes only root.ownerDocument and
  // capability.kind from this focused context port.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return port as ReactorContext;
}

function matrixValue(values: readonly number[], index: number): number {
  const value = values[index];
  if (value === undefined) throw new TypeError("Invalid matrix fixture.");
  return value;
}

function matrixComponents(transform: string | undefined): readonly number[] {
  if (transform === undefined || transform === "none")
    return [1, 0, 0, 1, 0, 0];
  const match = /^matrix\(([^)]+)\)$/u.exec(transform);
  if (match?.[1] === undefined) throw new TypeError("Invalid matrix fixture.");
  const values = match[1].split(",").map(Number);
  if (values.length !== 6) throw new TypeError("Invalid matrix fixture.");
  return values;
}

function createHarness(options: HarnessOptions = {}): Harness {
  const operations: string[] = [];
  const effectTargets: unknown[] = [];
  const animationConstructions = { count: 0 };
  const styles = new WeakMap<object, StylePort>();
  const style = { ...DEFAULT_STYLE, ...options.style };
  const matrixMode = options.matrix ?? "identity";

  class MatrixPort {
    readonly a: number;
    readonly b: number;
    readonly c: number;
    readonly d: number;
    readonly e: number;
    readonly f: number;
    readonly is2D: boolean;

    constructor(transform?: string) {
      const values =
        matrixMode === "singular"
          ? [0, 0, 0, 0, 0, 0]
          : matrixComponents(transform);
      this.a = matrixValue(values, 0);
      this.b = matrixValue(values, 1);
      this.c = matrixValue(values, 2);
      this.d = matrixValue(values, 3);
      this.e = matrixValue(values, 4);
      this.f = matrixValue(values, 5);
      this.is2D = matrixMode !== "three-dimensional";
    }
  }

  class EffectPort {
    private targetValue: unknown;
    private timing: Readonly<KeyframeEffectOptions>;

    constructor(
      targetOrSource: unknown,
      _frames?: readonly Keyframe[],
      timing?: Readonly<KeyframeEffectOptions>,
    ) {
      if (targetOrSource instanceof EffectPort) {
        if (
          targetOrSource.target === null &&
          options.probe === "clone-type-error"
        )
          throw new TypeError("known clone probe");
        this.targetValue = targetOrSource.target;
        this.timing = { ...targetOrSource.getTiming() };
        operations.push(
          this.targetValue === null ? "effect:probe-clone" : "effect:clone",
        );
        return;
      }
      this.targetValue = targetOrSource;
      this.timing = { delay: 0, ...timing };
      effectTargets.push(targetOrSource);
      operations.push(
        targetOrSource === null ? "effect:probe" : "effect:target",
      );
      if (targetOrSource !== null) return;
      if (options.probe === "type-error") throw new TypeError("known probe");
      if (options.probe === "unknown-error") throw PROBE_ERROR;
    }

    get target(): unknown {
      return this.targetValue;
    }

    set target(value: unknown) {
      this.targetValue = value;
      if (value !== null) {
        effectTargets.push(value);
        operations.push("effect:target");
      }
    }

    getTiming(): Readonly<KeyframeEffectOptions> {
      return this.timing;
    }

    updateTiming(timing: Readonly<OptionalEffectTiming>): void {
      this.timing = { ...this.timing, ...timing };
    }
  }

  class AnimationPort extends EventTarget {
    cancelCalls = 0;
    id = "";
    playCalls = 0;
    startTime: number | null = null;

    constructor() {
      super();
      animationConstructions.count += 1;
      operations.push("animation");
    }

    cancel(): void {
      this.cancelCalls += 1;
    }

    play(): void {
      this.playCalls += 1;
    }
  }

  const api = options.api ?? "complete";
  const cssMode = options.css ?? "supported";
  const windowPort: Record<string, unknown> = {
    CSS:
      cssMode === "missing"
        ? undefined
        : { supports: (): boolean => cssMode === "supported" },
    TypeError,
    getComputedStyle: (element: object): StylePort => {
      operations.push("read");
      if (options.computedStyleError !== undefined)
        throw options.computedStyleError;
      const computed = styles.get(element);
      if (computed === undefined) throw new Error("Unknown style target.");
      return computed;
    },
  };
  if (api !== "missing-effect") windowPort.KeyframeEffect = EffectPort;
  if (api !== "missing-animation") windowPort.Animation = AnimationPort;
  if (api !== "missing-matrix") windowPort.DOMMatrixReadOnly = MatrixPort;
  const windowValue = asWindow(windowPort);
  const documentValue = asDocument({
    defaultView: options.defaultView === "null" ? null : windowValue,
    timeline: { currentTime: 480 },
  });

  function child(): HTMLElement {
    const port = {
      offsetHeight: 120,
      offsetWidth: 240,
      style: {
        getPropertyPriority: (property: string): string =>
          property === options.importantProperty ? "important" : "",
      },
    };
    styles.set(port, style);
    return asElement(port);
  }

  function world(): HTMLElement {
    const product = child();
    const copy = child();
    const material = child();
    const word = child();
    const orbits = [child(), child()];
    const shards = [child(), child(), child()];
    const single = new Map<string, HTMLElement>([
      [REACTOR_MOTION_SELECTOR.product, product],
      [REACTOR_MOTION_SELECTOR.copy, copy],
      [REACTOR_MOTION_SELECTOR.material, material],
      [REACTOR_MOTION_SELECTOR.word, word],
    ]);
    return asElement({
      dataset: { flavor: "original" },
      querySelector: (selector: string): HTMLElement | null =>
        single.get(selector) ?? null,
      querySelectorAll: (selector: string): readonly HTMLElement[] =>
        selector === REACTOR_MOTION_SELECTOR.orbit
          ? orbits
          : selector === REACTOR_MOTION_SELECTOR.shard
            ? shards
            : [],
    });
  }

  const root = asElement({ ownerDocument: documentValue });
  return {
    animationConstructions,
    context: asContext({ capability: { kind: "full" }, root }),
    effectTargets,
    incoming: world(),
    operations,
    outgoing: world(),
  };
}

const PROBE_ERROR = new Error("unknown capability probe failure");
const STYLE_ERROR = new Error("computed style failed");

function createPlayer(harness: Harness) {
  return createNativeReactorPlayer({
    context: harness.context,
    incoming: harness.incoming,
    onComplete: vi.fn(),
    onFailure: vi.fn(),
    outgoing: harness.outgoing,
  });
}

describe("native Reactor capability and read boundary", () => {
  it("GIVEN a detached document WHEN the native factory runs THEN it stays unavailable without probing", () => {
    const harness = createHarness({ defaultView: "null" });

    expect(createPlayer(harness)).toBeNull();
    expect(harness.effectTargets).toEqual([]);
  });

  it.each([
    { api: "missing-animation", css: "supported" },
    { api: "missing-effect", css: "supported" },
    { api: "missing-matrix", css: "supported" },
    { api: "complete", css: "missing" },
    { api: "complete", css: "unsupported" },
  ] as const)(
    "GIVEN unavailable $api APIs and $css CSS support WHEN probed THEN native stays disabled",
    ({ api, css }) => {
      const harness = createHarness({ api, css });

      expect(createPlayer(harness)).toBeNull();
      expect(harness.animationConstructions.count).toBe(0);
    },
  );

  it("GIVEN the native parsing probe throws its realm TypeError WHEN probed THEN the verified fallback remains available", () => {
    const harness = createHarness({ probe: "type-error" });

    expect(createPlayer(harness)).toBeNull();
    expect(harness.animationConstructions.count).toBe(0);
  });

  it("GIVEN the public effect copy constructor rejects its source WHEN probed THEN native stays disabled before reading presentation", () => {
    const harness = createHarness({ probe: "clone-type-error" });

    expect(createPlayer(harness)).toBeNull();
    expect(harness.effectTargets).toEqual([null]);
    expect(harness.operations).toEqual(["effect:probe"]);
    expect(harness.animationConstructions.count).toBe(0);
  });

  it("GIVEN the native parsing probe throws an unknown error WHEN probed THEN the exact failure escapes", () => {
    const harness = createHarness({ probe: "unknown-error" });

    expect(() => createPlayer(harness)).toThrow(PROBE_ERROR);
  });

  it.each([
    { importantProperty: "opacity", label: "inline important presentation" },
    { label: "independent transform", style: { translate: "4px" } },
    { label: "inherited hidden visibility", style: { visibility: "hidden" } },
    { label: "custom word clipping", style: { clipPath: "polygon(0 0)" } },
    { label: "a 3D matrix", matrix: "three-dimensional" },
    { label: "a singular matrix", matrix: "singular" },
  ] as const)(
    "GIVEN $label WHEN the world is read THEN native returns control to GSAP",
    (scenario) => {
      const harness = createHarness(scenario);

      expect(createPlayer(harness)).toBeNull();
      expect(harness.animationConstructions.count).toBe(0);
      expect(harness.effectTargets).toEqual([null]);
    },
  );

  it("GIVEN two supported worlds WHEN the factory and player run THEN all reads finish before any targeted effect or Animation construction", () => {
    const harness = createHarness();
    const player = createPlayer(harness);

    expect(player).not.toBeNull();
    expect(harness.effectTargets).toEqual([null]);
    expect(harness.animationConstructions.count).toBe(0);
    expect(
      harness.operations.filter((operation) => operation === "read"),
    ).toHaveLength(18);

    player?.play();
    const lastRead = harness.operations.lastIndexOf("read");
    const firstTargetEffect = harness.operations.indexOf("effect:target");
    expect(firstTargetEffect).toBeGreaterThan(lastRead);
    expect(harness.animationConstructions.count).toBe(12);
    expect(harness.effectTargets.slice(1)).toHaveLength(12);
    player?.destroy();
  });

  it("GIVEN computed style throws an unknown error WHEN a world is read THEN the exact failure escapes", () => {
    const harness = createHarness({ computedStyleError: STYLE_ERROR });

    expect(() => createPlayer(harness)).toThrow(STYLE_ERROR);
    expect(harness.animationConstructions.count).toBe(0);
  });
});
