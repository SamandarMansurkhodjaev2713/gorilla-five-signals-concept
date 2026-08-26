import { Buffer } from "node:buffer";

import {
  expect,
  test,
  type Browser,
  type Page,
  type TestInfo,
} from "@playwright/test";
import { z } from "zod";

const RUN_COUNT = 3;
const PERFORMANCE_ORIGIN = "http://127.0.0.1:4322";
const CPU_THROTTLING_RATE = 1;
const FRAME_WORK_LIMIT_MS = 16;
const LONG_TASK_LIMIT_MS = 50;
const INTERACTION_LIMIT_MS = 200;
const MOTION_SETTLE_MS = 960;
const SCROLL_STEP_PX = 320;
const MAX_SCROLL_STEPS = 72;
const MOTION_PREFERENCE_KEY = "gorilla:motion-preference:v1";

interface BrowserPerformanceStore {
  eventTimingSupported: boolean;
  eventTimings: Record<string, number | string>[];
  longAnimationFrameSupported: boolean;
  longAnimationFrames: Record<string, number | string>[];
  longTaskSupported: boolean;
  longTasks: Record<string, number | string>[];
  phaseStartedAt: number;
}

declare global {
  interface Window {
    __gorillaPerfEvidence?: BrowserPerformanceStore;
  }
}

const timingSchema = z.object({
  duration: z.number().nonnegative(),
  name: z.string(),
  startTime: z.number().nonnegative(),
});
const eventTimingSchema = timingSchema.extend({
  inputDelay: z.number().nonnegative(),
  interactionId: z.number().int().nonnegative(),
  presentationDelay: z.number().nonnegative(),
  processingDuration: z.number().nonnegative(),
});
const longAnimationFrameSchema = timingSchema.extend({
  blockingDuration: z.number().nonnegative(),
  forcedStyleAndLayoutDuration: z.number().nonnegative(),
  renderDuration: z.number().nonnegative(),
  scriptDuration: z.number().nonnegative(),
  scrollY: z.number().nonnegative(),
  styleAndLayoutDuration: z.number().nonnegative(),
});
const evidenceSchema = z.object({
  eventTimingSupported: z.boolean(),
  eventTimings: z.array(eventTimingSchema),
  longAnimationFrameSupported: z.boolean(),
  longAnimationFrames: z.array(longAnimationFrameSchema),
  longTaskSupported: z.boolean(),
  longTasks: z.array(timingSchema),
  phaseStartedAt: z.number().nonnegative(),
});
type PerformanceEvidence = z.infer<typeof evidenceSchema>;

async function installPerformanceObservers(page: Page): Promise<void> {
  await page.addInitScript(
    ({ motionPreferenceKey }) => {
      localStorage.setItem(motionPreferenceKey, "full");
      const supported = PerformanceObserver.supportedEntryTypes;
      const store = {
        eventTimingSupported: supported.includes("event"),
        eventTimings: [] as Record<string, number | string>[],
        longAnimationFrameSupported: supported.includes("long-animation-frame"),
        longAnimationFrames: [] as Record<string, number | string>[],
        longTaskSupported: supported.includes("longtask"),
        longTasks: [] as Record<string, number | string>[],
        phaseStartedAt: performance.now(),
      };
      window.__gorillaPerfEvidence = store;
      const readNumber = (target: object, key: string): number => {
        const value: unknown = Reflect.get(target, key);
        return typeof value === "number" && Number.isFinite(value) && value >= 0
          ? value
          : 0;
      };

      if (store.longTaskSupported) {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.startTime < store.phaseStartedAt) {
              continue;
            }
            store.longTasks.push({
              duration: entry.duration,
              name: entry.name,
              startTime: entry.startTime,
            });
          }
        }).observe({ entryTypes: ["longtask"] });
      }
      if (store.eventTimingSupported) {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.startTime < store.phaseStartedAt) {
              continue;
            }
            const rawInteractionId: unknown = Reflect.get(
              entry,
              "interactionId",
            );
            const processingStart = readNumber(entry, "processingStart");
            const processingEnd = readNumber(entry, "processingEnd");
            store.eventTimings.push({
              duration: entry.duration,
              inputDelay: Math.max(0, processingStart - entry.startTime),
              interactionId:
                typeof rawInteractionId === "number" ? rawInteractionId : 0,
              name: entry.name,
              presentationDelay: Math.max(
                0,
                entry.startTime + entry.duration - processingEnd,
              ),
              processingDuration: Math.max(0, processingEnd - processingStart),
              startTime: entry.startTime,
            });
          }
        }).observe({ entryTypes: ["event"] });
      }
      if (store.longAnimationFrameSupported) {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.startTime < store.phaseStartedAt) {
              continue;
            }
            const endTime = entry.startTime + entry.duration;
            const renderStart = readNumber(entry, "renderStart");
            const styleAndLayoutStart = readNumber(
              entry,
              "styleAndLayoutStart",
            );
            const rawScripts: unknown = Reflect.get(entry, "scripts");
            const scripts = Array.isArray(rawScripts)
              ? rawScripts.filter(
                  (script): script is object =>
                    typeof script === "object" && script !== null,
                )
              : [];
            store.longAnimationFrames.push({
              blockingDuration: readNumber(entry, "blockingDuration"),
              duration: entry.duration,
              forcedStyleAndLayoutDuration: scripts.reduce(
                (total, script) =>
                  total + readNumber(script, "forcedStyleAndLayoutDuration"),
                0,
              ),
              name: entry.name,
              renderDuration:
                renderStart >= entry.startTime ? endTime - renderStart : 0,
              scriptDuration: scripts.reduce(
                (total, script) => total + readNumber(script, "duration"),
                0,
              ),
              scrollY: Math.max(0, window.scrollY),
              startTime: entry.startTime,
              styleAndLayoutDuration:
                styleAndLayoutStart >= entry.startTime
                  ? endTime - styleAndLayoutStart
                  : 0,
            });
          }
        }).observe({ entryTypes: ["long-animation-frame"] });
      }
    },
    { motionPreferenceKey: MOTION_PREFERENCE_KEY },
  );
}

async function resetEvidence(page: Page): Promise<void> {
  await page.evaluate(() => {
    const store = window.__gorillaPerfEvidence;
    if (store === undefined) {
      throw new Error("Performance evidence store is missing.");
    }
    store.phaseStartedAt = performance.now();
    for (const values of [
      store.eventTimings,
      store.longAnimationFrames,
      store.longTasks,
    ]) {
      if (!Array.isArray(values)) {
        throw new Error("Performance evidence array is invalid.");
      }
      values.length = 0;
    }
  });
}

async function readEvidence(page: Page): Promise<PerformanceEvidence> {
  const raw: unknown = await page.evaluate(() => {
    const store = window.__gorillaPerfEvidence;
    if (store === undefined) {
      throw new Error("Performance evidence store is missing.");
    }
    const phaseStartedAt = store.phaseStartedAt;
    return structuredClone({
      ...store,
      eventTimings: store.eventTimings.filter(
        (entry) => Number(entry.startTime) >= phaseStartedAt,
      ),
      longAnimationFrames: store.longAnimationFrames.filter(
        (entry) => Number(entry.startTime) >= phaseStartedAt,
      ),
      longTasks: store.longTasks.filter(
        (entry) => Number(entry.startTime) >= phaseStartedAt,
      ),
    });
  });
  return evidenceSchema.parse(raw);
}

async function settleMotion(page: Page): Promise<void> {
  await page.evaluate(
    (minimumMs) =>
      new Promise<void>((resolve) => {
        const startedAt = performance.now();
        const waitFrame = (now: number): void => {
          if (now - startedAt >= minimumMs) {
            requestAnimationFrame(() => resolve());
            return;
          }
          requestAnimationFrame(waitFrame);
        };
        requestAnimationFrame(waitFrame);
      }),
    MOTION_SETTLE_MS,
  );
}

async function wheelToBoundary(
  page: Page,
  direction: "bottom" | "top",
): Promise<void> {
  const delta = direction === "bottom" ? SCROLL_STEP_PX : -SCROLL_STEP_PX;
  for (let index = 0; index < MAX_SCROLL_STEPS; index += 1) {
    const reached = await page.evaluate(
      (target) =>
        target === "bottom"
          ? scrollY + innerHeight >= document.documentElement.scrollHeight - 2
          : scrollY <= 0,
      direction,
    );
    if (reached) {
      return;
    }
    await page.mouse.wheel(0, delta);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
  }
  throw new Error(`Scroll did not reach the ${direction} boundary.`);
}

async function exerciseHeroPointer(page: Page): Promise<void> {
  await wheelToBoundary(page, "top");
  const box = await page.locator("[data-motion-scene='hero']").boundingBox();
  if (box === null) {
    throw new Error("Hero bounds are unavailable.");
  }
  const y = box.y + Math.min(box.height * 0.5, 420);
  for (let step = 0; step <= 12; step += 1) {
    await page.mouse.move(box.x + (box.width * step) / 12, y, { steps: 2 });
  }
  await page.mouse.move(box.x + box.width + 4, y);
}

async function exerciseProducts(page: Page): Promise<void> {
  const explorer = page.locator("[data-product-explorer]");
  for (let index = 0; index < MAX_SCROLL_STEPS; index += 1) {
    const inViewport = await explorer.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.bottom > 0 && bounds.top < innerHeight;
    });
    if (inViewport) {
      break;
    }
    await page.mouse.wheel(0, SCROLL_STEP_PX);
  }
  const selectors = explorer.locator("[data-product-selector]");
  const count = await selectors.count();
  for (let index = 0; index < count; index += 1) {
    await selectors.nth(index).click();
  }
}

function assertEvidence(
  evidence: PerformanceEvidence,
  runIndex: number,
  phase: string,
): void {
  expect.soft(evidence.longTaskSupported).toBe(true);
  expect.soft(evidence.longAnimationFrameSupported).toBe(true);
  expect.soft(evidence.eventTimingSupported).toBe(true);
  const interactions = evidence.eventTimings.filter(
    ({ interactionId }) => interactionId > 0,
  );
  const applicationFrameWork = evidence.longAnimationFrames.map((frame) => ({
    ...frame,
    duration: frame.scriptDuration + frame.styleAndLayoutDuration,
    name: "application-frame-work",
  }));
  const animationFrameBlocking = evidence.longAnimationFrames.map((frame) => ({
    ...frame,
    duration: frame.blockingDuration,
    name: "animation-frame-blocking",
  }));
  assertMaximumDuration({
    entries: evidence.longTasks,
    limitMs: LONG_TASK_LIMIT_MS,
    metric: "long task",
    phase,
    runIndex,
  });
  assertMaximumDuration({
    entries: applicationFrameWork,
    limitMs: FRAME_WORK_LIMIT_MS,
    metric: "application work inside a long animation frame",
    phase,
    runIndex,
  });
  assertMaximumDuration({
    entries: animationFrameBlocking,
    limitMs: FRAME_WORK_LIMIT_MS,
    metric: "blocking inside a long animation frame",
    phase,
    runIndex,
  });
  assertMaximumDuration({
    entries: interactions,
    limitMs: INTERACTION_LIMIT_MS,
    metric: "interaction",
    phase,
    runIndex,
  });
}

function assertMaximumDuration(options: {
  entries: {
    blockingDuration?: number;
    duration: number;
    forcedStyleAndLayoutDuration?: number;
    inputDelay?: number;
    name: string;
    presentationDelay?: number;
    processingDuration?: number;
    renderDuration?: number;
    scriptDuration?: number;
    scrollY?: number;
    startTime: number;
    styleAndLayoutDuration?: number;
  }[];
  limitMs: number;
  metric: string;
  phase: string;
  runIndex: number;
}): void {
  const ordered = [...options.entries].sort(
    (left, right) => right.duration - left.duration,
  );
  const maximum = ordered.at(0)?.duration ?? 0;
  const slowest = ordered
    .slice(0, 5)
    .map((entry) => {
      const frameBreakdown =
        entry.scrollY === undefined
          ? ""
          : ` y=${entry.scrollY.toFixed(0)} script=${(entry.scriptDuration ?? 0).toFixed(1)} render=${(entry.renderDuration ?? 0).toFixed(1)} layout-tail=${(entry.styleAndLayoutDuration ?? 0).toFixed(1)} forced-layout=${(entry.forcedStyleAndLayoutDuration ?? 0).toFixed(1)} blocking=${(entry.blockingDuration ?? 0).toFixed(1)}`;
      const interactionBreakdown =
        entry.inputDelay === undefined
          ? ""
          : ` input=${entry.inputDelay.toFixed(1)} processing=${(entry.processingDuration ?? 0).toFixed(1)} presentation=${(entry.presentationDelay ?? 0).toFixed(1)}`;
      return `${entry.name}@${entry.startTime.toFixed(1)}ms=${entry.duration.toFixed(1)}ms${frameBreakdown}${interactionBreakdown}`;
    })
    .join(", ");
  expect
    .soft(
      maximum,
      `Run ${String(options.runIndex + 1)} ${options.phase} ${options.metric}; slowest: ${slowest || "none"}`,
    )
    .toBeLessThanOrEqual(options.limitMs);
}

async function measurePhase(options: {
  action: () => Promise<void>;
  name: string;
  page: Page;
  runIndex: number;
  testInfo: TestInfo;
}): Promise<{
  evidence: PerformanceEvidence;
  name: string;
}> {
  await resetEvidence(options.page);
  await options.action();
  await settleMotion(options.page);
  const evidence = await readEvidence(options.page);
  await options.testInfo.attach(
    `run-${String(options.runIndex + 1)}-${options.name}.json`,
    {
      body: Buffer.from(JSON.stringify(evidence, undefined, 2)),
      contentType: "application/json",
    },
  );
  return { evidence, name: options.name };
}

async function runJourney(
  browser: Browser,
  runIndex: number,
  testInfo: TestInfo,
): Promise<void> {
  const context = await browser.newContext({
    baseURL: PERFORMANCE_ORIGIN,
    colorScheme: "dark",
    reducedMotion: "no-preference",
    serviceWorkers: "block",
    viewport: { height: 900, width: 1440 },
  });
  const page = await context.newPage();
  const session = await context.newCDPSession(page);
  await session.send("Emulation.setCPUThrottlingRate", {
    rate: CPU_THROTTLING_RATE,
  });
  await installPerformanceObservers(page);
  await page.goto("/uz/", { waitUntil: "load" });
  const phaseEvidence: {
    evidence: PerformanceEvidence;
    name: string;
  }[] = [];
  try {
    phaseEvidence.push(
      await measurePhase({
        action: async (): Promise<void> => {
          await page.locator("[data-responsible-continue]").click();
          await page
            .locator('html[data-motion-runtime-state="ready"]')
            .waitFor();
        },
        name: "confirmation-startup",
        page,
        runIndex,
        testInfo,
      }),
    );
    phaseEvidence.push(
      await measurePhase({
        action: (): Promise<void> => wheelToBoundary(page, "bottom"),
        name: "cold-scroll",
        page,
        runIndex,
        testInfo,
      }),
    );
    phaseEvidence.push(
      await measurePhase({
        action: async (): Promise<void> => {
          await wheelToBoundary(page, "top");
          await wheelToBoundary(page, "bottom");
        },
        name: "warm-scroll",
        page,
        runIndex,
        testInfo,
      }),
    );
    phaseEvidence.push(
      await measurePhase({
        action: (): Promise<void> => exerciseHeroPointer(page),
        name: "hero-pointer",
        page,
        runIndex,
        testInfo,
      }),
    );
    phaseEvidence.push(
      await measurePhase({
        action: (): Promise<void> => exerciseProducts(page),
        name: "product-selection",
        page,
        runIndex,
        testInfo,
      }),
    );
  } finally {
    await context.close();
  }
  for (const phase of phaseEvidence) {
    assertEvidence(phase.evidence, runIndex, phase.name);
  }
}

test("GIVEN confirmed full motion WHEN the complete product journey runs THEN no interaction exceeds the hard frame budget", async ({
  browser,
}, testInfo) => {
  for (let runIndex = 0; runIndex < RUN_COUNT; runIndex += 1) {
    await runJourney(browser, runIndex, testInfo);
  }
});
