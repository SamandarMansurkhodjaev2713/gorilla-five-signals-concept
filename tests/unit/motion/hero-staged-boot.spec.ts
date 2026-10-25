import { describe, expect, it } from "vitest";

import {
  HERO_CAN_COMPACT_ENTRY_SPEC,
  HERO_CAN_ENTRY_SPEC,
  HERO_COMPACT_MEDIA_QUERY,
} from "@/motion/hero-can-spec";
import { createFullHeroBoot } from "@/motion/scene-setups/hero-full-boot";
import { HERO_HOOKS } from "@/motion/scene-setups/hero-hooks";
import { MOTION_DURATION_SECONDS, MOTION_EASE } from "@/motion/tokens";

import type { SceneSetupContext } from "@/motion/create-scene";
import type { HeroBootStage } from "@/motion/scene-setups/hero-full-boot";

interface TargetStub {
  readonly name: string;
}

interface TimelineCall {
  readonly position: number;
  readonly targets: unknown;
  readonly vars: Readonly<Record<string, unknown>>;
}

interface ProgressCall {
  readonly progress: number;
  readonly suppressEvents: boolean | undefined;
}

class TweenHarness {
  readonly totalProgressCalls: ProgressCall[] = [];

  totalProgress(progress: number, suppressEvents?: boolean): this {
    this.totalProgressCalls.push({ progress, suppressEvents });
    return this;
  }
}

class TimelineHarness {
  readonly children: TweenHarness[] = [];
  readonly fromCalls: TimelineCall[] = [];
  readonly playCalls: (number | string | undefined)[] = [];

  duration(): number {
    return this.fromCalls.reduce((latestEnd, { position, vars }) => {
      const duration = vars.duration;
      return typeof duration === "number"
        ? Math.max(latestEnd, position + duration)
        : latestEnd;
    }, 0);
  }

  from(
    targets: unknown,
    vars: Readonly<Record<string, unknown>>,
    position: number,
  ): this {
    this.fromCalls.push({ position, targets, vars });
    this.children.push(new TweenHarness());
    return this;
  }

  getChildren(): readonly TweenHarness[] {
    return this.children;
  }

  play(position?: number | string): this {
    this.playCalls.push(position);
    return this;
  }
}

interface HeroTargets {
  readonly frequency: readonly TargetStub[];
  readonly ghosts: readonly TargetStub[];
  readonly plate: TargetStub;
  readonly primary: TargetStub;
  readonly support: readonly TargetStub[];
  readonly title: readonly TargetStub[];
}

interface HeroHarness {
  readonly context: SceneSetupContext;
  readonly targets: HeroTargets;
  readonly timeline: TimelineHarness;
  readonly timelineOptions: unknown[];
}

const FULL_EFFECTIVE_STARTS = [
  0, 0.045, 0.09, 0.135, 0.18, 0.32, 0.365, 0.425, 0.765, 1.105, 1.145, 1.185,
  1.225, 1.305, 1.355, 1.405,
] as const;
const FULL_TIMELINE_DURATION_SECONDS = 1.665;
const EXPECTED_WARMUP_CALLS: readonly ProgressCall[] = [
  { progress: 1, suppressEvents: true },
  { progress: 0, suppressEvents: true },
];

function target(name: string): TargetStub {
  return { name };
}

function targets(prefix: string, count: number): readonly TargetStub[] {
  return Array.from({ length: count }, (_, index) =>
    target(`${prefix}-${String(index + 1)}`),
  );
}

function createTargets(): HeroTargets {
  return {
    frequency: targets("frequency", 5),
    ghosts: targets("ghost", 4),
    plate: target("signal-plate"),
    primary: target("primary-can"),
    support: targets("support", 3),
    title: targets("title", 2),
  };
}

function createHeroHarness(
  options: {
    readonly compact?: boolean;
    readonly includePlate?: boolean;
    readonly includePrimary?: boolean;
    readonly missingRequired?: string;
  } = {},
): HeroHarness {
  const timeline = new TimelineHarness();
  const timelineOptions: unknown[] = [];
  const heroTargets = createTargets();
  const groups = new Map<string, readonly TargetStub[]>([
    [HERO_HOOKS.frequency, heroTargets.frequency],
    [HERO_HOOKS.ghosts, heroTargets.ghosts],
    [HERO_HOOKS.support, heroTargets.support],
    [HERO_HOOKS.title, heroTargets.title],
  ]);
  if (options.missingRequired !== undefined)
    groups.delete(options.missingRequired);
  const singles = new Map<string, TargetStub>();
  if (options.includePrimary !== false)
    singles.set(HERO_HOOKS.primary, heroTargets.primary);
  if (options.includePlate !== false)
    singles.set(HERO_HOOKS.plate, heroTargets.plate);

  const contextStub = {
    gsap: {
      timeline: (settings: unknown): TimelineHarness => {
        timelineOptions.push(settings);
        return timeline;
      },
    },
    query: (selector: string): TargetStub | null =>
      singles.get(selector) ?? null,
    queryAll: (selector: string): readonly TargetStub[] =>
      groups.get(selector) ?? [],
    root: {
      ownerDocument: {
        defaultView: {
          matchMedia: (query: string) => ({
            matches:
              query === HERO_COMPACT_MEDIA_QUERY && options.compact === true,
          }),
        },
      },
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TYPE-EXCEPTION: This documented fake implements only the DOM and GSAP surfaces used by createFullHeroBoot.
  const context = contextStub as unknown as SceneSetupContext;
  return { context, targets: heroTargets, timeline, timelineOptions };
}

function flattenedTargets(heroTargets: HeroTargets): readonly TargetStub[] {
  return [
    ...heroTargets.frequency,
    ...heroTargets.title,
    heroTargets.primary,
    heroTargets.plate,
    ...heroTargets.ghosts,
    ...heroTargets.support,
  ];
}

function runStage(stages: readonly HeroBootStage[], index: number): void {
  const stage = stages[index];
  if (stage === undefined) {
    throw new Error(`Missing hero setup stage ${String(index)}.`);
  }
  stage.run();
}

function expectEffectiveStarts(
  calls: readonly TimelineCall[],
  expected: readonly number[],
): void {
  expect(calls).toHaveLength(expected.length);
  calls.forEach(({ position }, index) => {
    expect(position).toBeCloseTo(expected[index] ?? Number.NaN, 10);
  });
}

function expectedEffects(heroTargets: HeroTargets): readonly unknown[] {
  const repeat = <T>(
    items: readonly T[],
    vars: Readonly<Record<string, unknown>>,
  ) => items.map((targetItem) => ({ targets: targetItem, vars }));
  return [
    ...repeat(heroTargets.frequency, {
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.material,
      scaleY: 0,
      transformOrigin: "top center",
    }),
    ...repeat(heroTargets.title, {
      clipPath: "inset(0 0 100% 0)",
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.enter,
      yPercent: 104,
    }),
    {
      targets: heroTargets.primary,
      vars: {
        duration: MOTION_DURATION_SECONDS.entranceMax,
        ease: MOTION_EASE.settle,
        rotate: HERO_CAN_ENTRY_SPEC.rotationDegrees,
        scale: HERO_CAN_ENTRY_SPEC.scale,
        y: HERO_CAN_ENTRY_SPEC.travelY,
      },
    },
    {
      targets: heroTargets.plate,
      vars: {
        clipPath: "inset(0 100% 0 0)",
        duration: MOTION_DURATION_SECONDS.scene,
        ease: MOTION_EASE.material,
      },
    },
    ...repeat(heroTargets.ghosts, {
      autoAlpha: 0,
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.enter,
      scale: 0.82,
      x: 44,
    }),
    ...repeat(heroTargets.support, {
      autoAlpha: 0,
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.enter,
      y: 18,
    }),
  ];
}

describe("createFullHeroBoot", () => {
  it("GIVEN the full hero boot is registered WHEN no stage runs THEN it exposes one paused stage per real target without placeholders", () => {
    const harness = createHeroHarness();
    const boot = createFullHeroBoot(harness.context);

    expect(harness.timelineOptions).toEqual([{ paused: true }]);
    expect(boot.stages).toHaveLength(16);
    expect(
      boot.stages.every(
        ({ targets: stageTargets }) => stageTargets.length === 1,
      ),
    ).toBe(true);
    expect(
      boot.stages.flatMap(({ targets: stageTargets }) => stageTargets),
    ).toEqual(flattenedTargets(harness.targets));
    expect(harness.timeline.fromCalls).toEqual([]);
    expect(harness.timeline.playCalls).toEqual([]);
  });

  it("GIVEN all target stages WHEN they run in order THEN effective timing and every visual parameter remain exact", () => {
    const harness = createHeroHarness();
    const boot = createFullHeroBoot(harness.context);

    boot.stages.forEach(({ run }) => run());

    expectEffectiveStarts(harness.timeline.fromCalls, FULL_EFFECTIVE_STARTS);
    expect(
      harness.timeline.fromCalls.map(({ targets: callTargets, vars }) => ({
        targets: callTargets,
        vars,
      })),
    ).toEqual(expectedEffects(harness.targets));
    expect(harness.timeline.duration()).toBeCloseTo(
      FULL_TIMELINE_DURATION_SECONDS,
      10,
    );
    expect(harness.timeline.playCalls).toEqual([]);
    boot.play();
    expect(harness.timeline.playCalls).toEqual([0]);
  });

  it("GIVEN sequential target stages WHEN each tween is installed THEN only the new tween is warmed end-to-start with events suppressed", () => {
    const harness = createHeroHarness();
    const boot = createFullHeroBoot(harness.context);

    boot.stages.forEach(({ run }, stageIndex) => {
      run();

      expect(harness.timeline.children).toHaveLength(stageIndex + 1);
      expect(
        harness.timeline.children.map(({ totalProgressCalls }) =>
          totalProgressCalls.slice(),
        ),
      ).toEqual(
        Array.from({ length: stageIndex + 1 }, () => EXPECTED_WARMUP_CALLS),
      );
    });
  });

  it.each([
    ["compact", true, HERO_CAN_COMPACT_ENTRY_SPEC],
    ["general", false, HERO_CAN_ENTRY_SPEC],
  ] as const)(
    "GIVEN the %s viewport WHEN the primary target stage runs THEN it uses the shared entry specification",
    (_viewport, compact, entry) => {
      const harness = createHeroHarness({ compact });
      const boot = createFullHeroBoot(harness.context);

      runStage(boot.stages, 7);

      expect(harness.timeline.fromCalls).toEqual([
        {
          position: -0.58,
          targets: harness.targets.primary,
          vars: {
            duration: MOTION_DURATION_SECONDS.entranceMax,
            ease: MOTION_EASE.settle,
            rotate: entry.rotationDegrees,
            scale: entry.scale,
            y: entry.travelY,
          },
        },
      ]);
    },
  );

  it("GIVEN optional primary and plate targets are absent WHEN every stage runs THEN no placeholder stage is created and required groups remain ordered", () => {
    const harness = createHeroHarness({
      includePlate: false,
      includePrimary: false,
    });
    const boot = createFullHeroBoot(harness.context);

    boot.stages.forEach(({ run }) => run());

    expect(boot.stages).toHaveLength(14);
    expect(
      boot.stages.flatMap(({ targets: stageTargets }) => stageTargets),
    ).toEqual([
      ...harness.targets.frequency,
      ...harness.targets.title,
      ...harness.targets.ghosts,
      ...harness.targets.support,
    ]);
    expectEffectiveStarts(
      harness.timeline.fromCalls,
      [
        0, 0.045, 0.09, 0.135, 0.18, 0.32, 0.365, 0.705, 0.745, 0.785, 0.825,
        0.905, 0.955, 1.005,
      ],
    );
    expect(harness.timeline.playCalls).toEqual([]);
  });

  it.each([
    HERO_HOOKS.frequency,
    HERO_HOOKS.title,
    HERO_HOOKS.ghosts,
    HERO_HOOKS.support,
  ])(
    "GIVEN required group %s is empty WHEN boot is created THEN registration fails explicitly",
    (missingRequired) => {
      const harness = createHeroHarness({ missingRequired });

      expect(() => createFullHeroBoot(harness.context)).toThrow(
        `Full Hero requires ${missingRequired}.`,
      );
      expect(harness.timeline.fromCalls).toEqual([]);
    },
  );
});
