import {
  REACTOR_MOTION_SELECTOR,
  requireWorldElement,
  trajectoryFor,
} from "../flavor-reactor-presentation";
import { decomposeReactorTransform } from "./reactor-transform";
import { UnsupportedReactorPresentation } from "./reactor-native-types";

import type {
  ReactorBaseline,
  ReactorWorldBaseline,
} from "./reactor-native-types";

const OWNED_PROPERTIES = [
  "transform",
  "translate",
  "rotate",
  "scale",
  "opacity",
  "visibility",
  "clip-path",
  "transform-origin",
] as const;
const EXPECTED_ORBITS = 2;
const EXPECTED_SHARDS = 3;

function readPose(
  matrix: DOMMatrixReadOnly,
  box: { width: number; height: number },
) {
  try {
    return decomposeReactorTransform(matrix, box);
  } catch (error: unknown) {
    if (!(error instanceof RangeError)) throw error;
    throw new UnsupportedReactorPresentation(
      "The authored matrix requires the GSAP player.",
      { cause: error },
    );
  }
}

function readBaseline(
  element: HTMLElement,
  windowValue: Window & typeof globalThis,
): ReactorBaseline {
  if (
    OWNED_PROPERTIES.some(
      (property) => element.style.getPropertyPriority(property) === "important",
    )
  )
    throw new UnsupportedReactorPresentation(
      "Important presentation uses the GSAP cascade-compatible player.",
    );
  const style = windowValue.getComputedStyle(element);
  if (style.visibility !== "visible")
    throw new UnsupportedReactorPresentation(
      "Inherited hidden presentation requires the GSAP player.",
    );
  if (
    [style.translate, style.rotate, style.scale].some(
      (value) => value !== "none",
    )
  )
    throw new UnsupportedReactorPresentation(
      "Independent transforms require the GSAP player.",
    );
  const matrix = new windowValue.DOMMatrixReadOnly(
    style.transform === "none" ? undefined : style.transform,
  );
  if (!matrix.is2D)
    throw new UnsupportedReactorPresentation(
      "Reactor requires a supported 2D transform.",
    );
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  const pose = readPose(matrix, { width, height });
  const opacity = Number(style.opacity);
  if (!Number.isFinite(opacity))
    throw new UnsupportedReactorPresentation("Invalid computed opacity.");
  return {
    element,
    pose,
    opacity,
    visibility: style.visibility,
    clipPath: style.clipPath,
  };
}

/** Complete every style/geometry read before any native effect is constructed. */
export function readReactorWorld(
  world: HTMLElement,
  windowValue: Window & typeof globalThis,
): ReactorWorldBaseline {
  const orbits = Array.from(
    world.querySelectorAll<HTMLElement>(REACTOR_MOTION_SELECTOR.orbit),
  );
  const shards = Array.from(
    world.querySelectorAll<HTMLElement>(REACTOR_MOTION_SELECTOR.shard),
  );
  if (orbits.length !== EXPECTED_ORBITS || shards.length !== EXPECTED_SHARDS)
    throw new UnsupportedReactorPresentation(
      "Unexpected Reactor role cardinality.",
    );
  const word = readBaseline(
    requireWorldElement(world, REACTOR_MOTION_SELECTOR.word),
    windowValue,
  );
  if (word.clipPath !== "none")
    throw new UnsupportedReactorPresentation(
      "Custom word clipping requires the GSAP player.",
    );
  return {
    trajectory: trajectoryFor(world),
    product: readBaseline(
      requireWorldElement(world, REACTOR_MOTION_SELECTOR.product),
      windowValue,
    ),
    copy: readBaseline(
      requireWorldElement(world, REACTOR_MOTION_SELECTOR.copy),
      windowValue,
    ),
    material: readBaseline(
      requireWorldElement(world, REACTOR_MOTION_SELECTOR.material),
      windowValue,
    ),
    word,
    orbits: orbits.map((element) => readBaseline(element, windowValue)),
    shards: shards.map((element) => readBaseline(element, windowValue)),
  };
}
