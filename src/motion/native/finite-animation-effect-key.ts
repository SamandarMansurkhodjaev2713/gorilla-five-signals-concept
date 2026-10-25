type StableFrameValue = boolean | null | number | string;
type StableFrameEntry = readonly [string, StableFrameValue];

interface EffectKeyInput {
  readonly durationMs: number;
  readonly easing: string;
  readonly frames: readonly Keyframe[];
}

function stableValue(value: unknown): value is StableFrameValue {
  if (value === null) return true;
  if (typeof value === "number") return Number.isFinite(value);
  return typeof value === "boolean" || typeof value === "string";
}

function compareEntries(
  [left]: StableFrameEntry,
  [right]: StableFrameEntry,
): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function stableFrame(frame: unknown): readonly StableFrameEntry[] | null {
  if (frame === null || typeof frame !== "object") return null;
  const prototype: unknown = Reflect.getPrototypeOf(frame);
  if (prototype !== Object.prototype && prototype !== null) return null;
  const entries: StableFrameEntry[] = [];
  for (const property of Reflect.ownKeys(frame)) {
    if (typeof property !== "string") return null;
    const descriptor = Reflect.getOwnPropertyDescriptor(frame, property);
    if (descriptor?.enumerable !== true) return null;
    if (!("value" in descriptor)) return null;
    const value: unknown = descriptor.value;
    if (!stableValue(value)) return null;
    entries.push([property, value]);
  }
  return entries.sort(compareEntries);
}

/** Return a side-effect-free reuse key only for losslessly serializable frames. */
export function reusableEffectKey(input: EffectKeyInput): string | null {
  const frames: StableFrameEntry[][] = [];
  for (const frame of input.frames) {
    const stable = stableFrame(frame);
    if (stable === null) return null;
    frames.push([...stable]);
  }
  return JSON.stringify([frames, input.durationMs, input.easing]);
}
