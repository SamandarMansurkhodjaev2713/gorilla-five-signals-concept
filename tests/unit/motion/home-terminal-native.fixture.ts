import type { TerminalEntranceTargets } from "@/motion/scene-setups/home-terminal-motion-contract";

function terminalTarget(name: string): HTMLElement {
  const port = { name };
  // TYPE-EXCEPTION: Pure plan and adapter tests preserve opaque target
  // identity; no unimplemented DOM behavior is read from this fixture.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return port as unknown as HTMLElement;
}

export function createTerminalTargets(): TerminalEntranceTargets {
  const word = terminalTarget("word");
  return {
    copy: Array.from({ length: 4 }, (_, index) =>
      terminalTarget(`copy-${String(index)}`),
    ),
    field: terminalTarget("field"),
    word,
    trace: [
      word,
      terminalTarget("north"),
      terminalTarget("east"),
      terminalTarget("route"),
    ],
    nodes: Array.from({ length: 5 }, (_, index) =>
      terminalTarget(`node-${String(index)}`),
    ),
    locator: terminalTarget("locator"),
    locatorSignals: [terminalTarget("grid"), terminalTarget("marker")],
    locatorCopy: Array.from({ length: 4 }, (_, index) =>
      terminalTarget(`locator-copy-${String(index)}`),
    ),
  };
}
