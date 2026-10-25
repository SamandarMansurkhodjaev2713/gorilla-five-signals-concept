import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const RUNTIME_SOURCE = readFileSync(
  new URL("../../../src/scripts/motion-runtime.ts", import.meta.url),
  "utf8",
);

function functionSource(name: string): string {
  const signature = `function ${name}`;
  const signatureStart = RUNTIME_SOURCE.indexOf(signature);
  if (signatureStart < 0) throw new Error(`Missing function ${name}.`);
  const bodyStart = RUNTIME_SOURCE.indexOf("{", signatureStart);
  if (bodyStart < 0) throw new Error(`Missing body for ${name}.`);
  let depth = 0;
  for (let index = bodyStart; index < RUNTIME_SOURCE.length; index += 1) {
    const character = RUNTIME_SOURCE[index];
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth === 0) return RUNTIME_SOURCE.slice(signatureStart, index + 1);
  }
  throw new Error(`Unclosed body for ${name}.`);
}

function expectOrdered(source: string, fragments: readonly string[]): void {
  let previousIndex = -1;
  for (const fragment of fragments) {
    const index = source.indexOf(fragment, previousIndex + 1);
    expect(index, `Missing ${fragment}`).toBeGreaterThan(previousIndex);
    previousIndex = index;
  }
}

describe("motion runtime startup scheduling source contract", () => {
  it("GIVEN confirmed entry WHEN controllers start THEN synchronous mounts lead directly into one guarded async launch", () => {
    const source = functionSource("scheduleConfirmedControllers");

    expect(source).not.toContain("requestAnimationFrame");
    expectOrdered(source, [
      "mountProductExplorer(activeGeneration)",
      "mountProductArchive(activeGeneration)",
      "launchAsync(mountConfirmedControllers(activeGeneration)",
    ]);
  });

  it("GIVEN motion activation WHEN scheduling starts THEN the loader launches directly without an outer frame gate", () => {
    const source = functionSource("scheduleMotionRuntime");

    expect(source).not.toContain("requestAnimationFrame");
    expect(source).toContain(
      "launchAsync(loadAndMountMotionRuntime(activeGeneration)",
    );
  });

  it("GIVEN the direct loader WHEN it imports the runtime THEN both inner paint frames and generation guards remain ordered", () => {
    const source = functionSource("loadAndMountMotionRuntime");

    expect(source.match(/await waitForAnimationFrame\(\)/g)).toHaveLength(2);
    expectOrdered(source, [
      "activeGeneration !== mountGeneration",
      "await waitForAnimationFrame()",
      "await loadMotionRuntimeFactory()",
      "await waitForAnimationFrame()",
      "mountMotionRuntime(activeGeneration, createMotionRuntime)",
    ]);
  });

  it("GIVEN a directly launched async path WHEN an unexpected rejection escapes THEN the shared guard publishes a diagnostic", () => {
    const source = functionSource("launchAsync");

    expect(source).toContain("operation.catch");
    expect(source).toContain("publishMotionDiagnostic(window");
    expect(functionSource("scheduleMotionRuntime")).toContain(
      'code: "engine-load-failed"',
    );
    expect(functionSource("scheduleConfirmedControllers")).toContain(
      'code: "controller-mount-failed"',
    );
  });

  it("GIVEN startup is still pending WHEN direct launch begins THEN no scheduler publishes early readiness", () => {
    expect(RUNTIME_SOURCE).not.toMatch(/motionRuntimeState\s*=/);
    expect(RUNTIME_SOURCE).toContain("nextRuntime.ready.catch");
    expect(functionSource("mountMotionRuntime")).toContain(
      "activeGeneration !== mountGeneration",
    );
  });
});
