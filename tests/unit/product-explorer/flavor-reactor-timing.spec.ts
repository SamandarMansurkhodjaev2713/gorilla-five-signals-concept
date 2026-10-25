import { describe, expect, it } from "vitest";

import { animateWorld } from "@/features/flavor-reactor/flavor-reactor-choreography";
import { FLAVOR_MOTION_SLUGS } from "@/features/flavor-reactor/flavor-reactor-motion-spec";
import { REACTOR_MOTION_SELECTOR } from "@/features/flavor-reactor/flavor-reactor-presentation";

import {
  MOTION_PERFORMANCE_PROFILE,
  MOTION_PERFORMANCE_SETTLE_MS,
} from "../../performance/support/performance-profile";

import type { FlavorMotionSlug } from "@/features/flavor-reactor/flavor-reactor-motion-spec";
import type { ReactorContext } from "@/features/flavor-reactor/flavor-reactor-presentation";

type TweenMethod = "from" | "fromTo" | "to";

interface AuthoredTween {
  readonly duration: number;
  readonly implicitAppend: boolean;
  readonly method: TweenMethod;
  readonly position: number;
  readonly stagger: number;
  readonly targetCount: number;
}

class TimelineHarness {
  readonly calls: AuthoredTween[] = [];
  private authoredDuration = 0;

  duration(): number {
    return this.authoredDuration;
  }

  from(
    targets: unknown,
    variables: Readonly<Record<string, unknown>>,
    position?: number,
  ): this {
    return this.record("from", targets, variables, position);
  }

  fromTo(
    targets: unknown,
    _fromVariables: Readonly<Record<string, unknown>>,
    toVariables: Readonly<Record<string, unknown>>,
    position?: number,
  ): this {
    return this.record("fromTo", targets, toVariables, position);
  }

  to(
    targets: unknown,
    variables: Readonly<Record<string, unknown>>,
    position?: number,
  ): this {
    return this.record("to", targets, variables, position);
  }

  private record(
    method: TweenMethod,
    targets: unknown,
    variables: Readonly<Record<string, unknown>>,
    position: number | undefined,
  ): this {
    const duration = this.numberVariable(variables, "duration");
    const stagger = this.numberVariable(variables, "stagger", 0);
    const targetCount = Array.isArray(targets) ? targets.length : 1;
    const start = position ?? this.authoredDuration;
    const staggerTail = Math.max(0, targetCount - 1) * stagger;
    this.authoredDuration = Math.max(
      this.authoredDuration,
      start + duration + staggerTail,
    );
    this.calls.push({
      duration,
      implicitAppend: position === undefined,
      method,
      position: start,
      stagger,
      targetCount,
    });
    return this;
  }

  private numberVariable(
    variables: Readonly<Record<string, unknown>>,
    name: string,
    fallback?: number,
  ): number {
    const value = variables[name] ?? fallback;
    if (typeof value !== "number") {
      throw new Error(`Expected numeric timeline variable ${name}.`);
    }
    return value;
  }
}

interface ElementStub {
  readonly name: string;
}

function element(name: string): ElementStub {
  return { name };
}

function createWorld(slug: FlavorMotionSlug): HTMLElement {
  const singles = new Map<string, ElementStub>([
    [REACTOR_MOTION_SELECTOR.copy, element(`${slug}-copy`)],
    [REACTOR_MOTION_SELECTOR.material, element(`${slug}-material`)],
    [REACTOR_MOTION_SELECTOR.product, element(`${slug}-product`)],
    [REACTOR_MOTION_SELECTOR.word, element(`${slug}-word`)],
  ]);
  const groups = new Map<string, readonly ElementStub[]>([
    [
      REACTOR_MOTION_SELECTOR.orbit,
      [element(`${slug}-orbit-1`), element(`${slug}-orbit-2`)],
    ],
    [
      REACTOR_MOTION_SELECTOR.shard,
      [
        element(`${slug}-shard-1`),
        element(`${slug}-shard-2`),
        element(`${slug}-shard-3`),
      ],
    ],
  ]);
  const world = {
    dataset: { flavor: slug },
    querySelector: (selector: string): ElementStub | null =>
      singles.get(selector) ?? null,
    querySelectorAll: (selector: string): readonly ElementStub[] =>
      groups.get(selector) ?? [],
  };
  // TYPE-EXCEPTION: This timing harness implements only dataset and selector
  // surfaces consumed by the authored flavor choreography.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return world as unknown as HTMLElement;
}

function measureWorld(options: {
  readonly kind: "full" | "lite";
  readonly outgoing: boolean;
  readonly slug: FlavorMotionSlug;
}): TimelineHarness {
  const timeline = new TimelineHarness();
  const contextValue = {
    capability: { kind: options.kind, reason: "test" },
    gsap: { timeline: (): TimelineHarness => timeline },
  };
  // TYPE-EXCEPTION: This engine fake exposes only capability and timeline,
  // the surfaces animateWorld consumes in this authored-timing unit test.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const context = contextValue as unknown as ReactorContext;
  animateWorld({
    context,
    incoming: createWorld(options.slug),
    onComplete: () => undefined,
    outgoing: options.outgoing ? createWorld(options.slug) : null,
  });
  return timeline;
}

function expectDuration(timeline: TimelineHarness, milliseconds: number): void {
  expect(timeline.duration() * 1_000).toBeCloseTo(milliseconds, 8);
}

describe("flavor reactor authored timing", () => {
  it("GIVEN every flavor in full motion WHEN authored with or without departure THEN real tween calls settle at 2256ms", () => {
    for (const slug of FLAVOR_MOTION_SLUGS) {
      const withOutgoing = measureWorld({ kind: "full", outgoing: true, slug });
      const withoutOutgoing = measureWorld({
        kind: "full",
        outgoing: false,
        slug,
      });

      expectDuration(withOutgoing, 2_256);
      expectDuration(withoutOutgoing, 2_256);
      expect(withOutgoing.calls).toHaveLength(9);
      expect(withoutOutgoing.calls).toHaveLength(6);
    }
  });

  it("GIVEN full motion with departure WHEN its calls are inspected THEN explicit positions and implicit staggered appends produce the measured maximum", () => {
    const timeline = measureWorld({
      kind: "full",
      outgoing: true,
      slug: "original",
    });

    expect(timeline.calls).toEqual([
      {
        duration: 0.26,
        implicitAppend: true,
        method: "to",
        position: 0,
        stagger: 0,
        targetCount: 1,
      },
      {
        duration: 0.16,
        implicitAppend: false,
        method: "to",
        position: 0.12,
        stagger: 0,
        targetCount: 1,
      },
      {
        duration: 0.26,
        implicitAppend: false,
        method: "to",
        position: 0,
        stagger: 0,
        targetCount: 1,
      },
      {
        duration: 0.64,
        implicitAppend: false,
        method: "fromTo",
        position: 0,
        stagger: 0,
        targetCount: 1,
      },
      {
        duration: 0.88,
        implicitAppend: true,
        method: "from",
        position: 0.64,
        stagger: 0.032,
        targetCount: 2,
      },
      {
        duration: 0.64,
        implicitAppend: true,
        method: "from",
        position: 1.552,
        stagger: 0.032,
        targetCount: 3,
      },
      {
        duration: 0.88,
        implicitAppend: false,
        method: "fromTo",
        position: 0,
        stagger: 0,
        targetCount: 1,
      },
      {
        duration: 0.64,
        implicitAppend: false,
        method: "fromTo",
        position: 0.12,
        stagger: 0,
        targetCount: 1,
      },
      {
        duration: 0.64,
        implicitAppend: false,
        method: "from",
        position: 0.16,
        stagger: 0,
        targetCount: 1,
      },
    ]);
  });

  it("GIVEN lite motion WHEN departure is optional THEN actual authored calls settle at 540ms or 380ms", () => {
    for (const slug of FLAVOR_MOTION_SLUGS) {
      const withOutgoing = measureWorld({ kind: "lite", outgoing: true, slug });
      const withoutOutgoing = measureWorld({
        kind: "lite",
        outgoing: false,
        slug,
      });

      expectDuration(withOutgoing, 540);
      expectDuration(withoutOutgoing, 380);
      expect(withOutgoing.calls).toHaveLength(4);
      expect(withoutOutgoing.calls).toHaveLength(2);
    }
  });

  it("GIVEN the release observation tail WHEN compared with the measured authored maximum THEN it includes two frame-work margins", () => {
    const measuredMaximumMs = Math.max(
      ...FLAVOR_MOTION_SLUGS.flatMap((slug) => [
        measureWorld({ kind: "full", outgoing: true, slug }).duration() * 1_000,
        measureWorld({ kind: "full", outgoing: false, slug }).duration() *
          1_000,
        measureWorld({ kind: "lite", outgoing: true, slug }).duration() * 1_000,
        measureWorld({ kind: "lite", outgoing: false, slug }).duration() *
          1_000,
      ]),
    );

    expect(MOTION_PERFORMANCE_SETTLE_MS).toBeGreaterThanOrEqual(
      measuredMaximumMs + 2 * MOTION_PERFORMANCE_PROFILE.frameWorkMs,
    );
  });
});
