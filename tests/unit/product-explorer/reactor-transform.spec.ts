import { describe, expect, it } from "vitest";

import {
  decomposeReactorTransform,
  serializeReactorTransform,
  type Matrix2D,
  type TransformPose,
} from "@/features/flavor-reactor/native/reactor-transform";

const MATRIX_TOLERANCE = 0.000_05;
const BOX = { height: 180, width: 320 } as const;

function composeMatrix(
  pose: TransformPose,
  box: { readonly height: number; readonly width: number },
): Matrix2D {
  const rotation = (pose.rotationDegrees * Math.PI) / 180;
  const skew = Math.tan((pose.skewXDegrees * Math.PI) / 180);
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  return {
    a: cosine * pose.scaleX,
    b: sine * pose.scaleX,
    c: (cosine * skew - sine) * pose.scaleY,
    d: (sine * skew + cosine) * pose.scaleY,
    e: pose.x + (box.width * pose.xPercent) / 100,
    f: pose.y + (box.height * pose.yPercent) / 100,
  };
}

function expectMatrixParity(actual: Matrix2D, expected: Matrix2D): void {
  for (const key of ["a", "b", "c", "d", "e", "f"] as const) {
    expect(actual[key]).toBeCloseTo(expected[key], 4);
    expect(Math.abs(actual[key] - expected[key])).toBeLessThanOrEqual(
      MATRIX_TOLERANCE,
    );
  }
}

const IDENTITY_POSE: TransformPose = {
  rotationDegrees: 0,
  scaleX: 1,
  scaleY: 1,
  skewXDegrees: 0,
  x: 0,
  xPercent: 0,
  y: 0,
  yPercent: 0,
};
const SOURCE_POSES: readonly TransformPose[] = [
  IDENTITY_POSE,
  {
    rotationDegrees: 37,
    scaleX: 1.25,
    scaleY: 0.72,
    skewXDegrees: 18,
    x: 19,
    xPercent: 0,
    y: -34,
    yPercent: 0,
  },
  {
    rotationDegrees: -28,
    scaleX: 0.62,
    scaleY: -0.84,
    skewXDegrees: -12,
    x: -51,
    xPercent: 0,
    y: 24,
    yPercent: 0,
  },
  {
    rotationDegrees: 14,
    scaleX: -1.1,
    scaleY: 0.9,
    skewXDegrees: 9,
    x: 43,
    xPercent: 0,
    y: 17,
    yPercent: 0,
  },
];

describe("reactor native transform decomposition", () => {
  it.each(SOURCE_POSES)(
    "GIVEN a finite rotated, skewed or reflected matrix WHEN it is decomposed THEN serialization components reconstruct its visual matrix",
    (source) => {
      const matrix = composeMatrix(source, BOX);
      const pose = decomposeReactorTransform(matrix, BOX);

      expectMatrixParity(composeMatrix(pose, BOX), matrix);
    },
  );

  it("GIVEN half-box translations WHEN decomposed THEN GSAP's rounded auto-percent heuristic preserves percentage translation", () => {
    const box = { height: 101, width: 201 };
    const pose = decomposeReactorTransform(
      { a: 1, b: 0, c: 0, d: 1, e: -100.5, f: -50.5 },
      box,
    );

    expect(pose).toMatchObject({ x: 0, xPercent: -50, y: 0, yPercent: -50 });
    expectMatrixParity(composeMatrix(pose, box), {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: -100.5,
      f: -50.5,
    });
  });

  it("GIVEN a nearby translation WHEN rounded values do not match half the box THEN it remains a pixel translation", () => {
    const pose = decomposeReactorTransform(
      { a: 1, b: 0, c: 0, d: 1, e: -100, f: -50 },
      { height: 101, width: 201 },
    );

    expect(pose).toMatchObject({ x: -100, xPercent: 0, y: -50, yPercent: 0 });
  });

  it("GIVEN a zero-sized box and identity matrix WHEN decomposed THEN zero translation never becomes an inferred percentage", () => {
    const pose = decomposeReactorTransform(
      { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
      { height: 0, width: 0 },
    );

    expect(pose).toMatchObject({ x: 0, xPercent: 0, y: 0, yPercent: 0 });
  });

  it("GIVEN a pose override WHEN serialized THEN component order stays stable for native interpolation", () => {
    const rest = decomposeReactorTransform(
      { a: 1, b: 0, c: 0, d: 1, e: -160, f: 0 },
      BOX,
    );
    const start = {
      ...rest,
      rotationDegrees: 32,
      scaleX: 0.42,
      scaleY: 0.42,
    };

    expect(serializeReactorTransform(start)).toBe(
      "translate(-50%, 0%) translate3d(0px, 0px, 0px) rotate(32deg) skew(0deg, 0deg) scale(0.42, 0.42)",
    );
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "GIVEN a non-finite matrix component %s WHEN decomposed THEN it is rejected",
    (a) => {
      expect(() =>
        decomposeReactorTransform({ a, b: 0, c: 0, d: 1, e: 0, f: 0 }, BOX),
      ).toThrow(RangeError);
    },
  );

  it.each([
    { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 },
    { a: 1, b: 2, c: 2, d: 4, e: 0, f: 0 },
  ])(
    "GIVEN a singular 2D matrix WHEN decomposed THEN unsupported interpolation is rejected",
    (matrix) => {
      expect(() => decomposeReactorTransform(matrix, BOX)).toThrow(RangeError);
    },
  );

  it("GIVEN a DOMMatrix-compatible value flagged as 3D WHEN decomposed THEN its 2D projection is never approximated", () => {
    const matrix = {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 0,
      is2D: false,
    };

    expect(() => decomposeReactorTransform(matrix, BOX)).toThrow(RangeError);
  });

  it("GIVEN invalid geometry or pose values WHEN processed THEN neither decomposition nor serialization emits invalid CSS", () => {
    expect(() =>
      decomposeReactorTransform(
        { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
        { height: Number.POSITIVE_INFINITY, width: 1 },
      ),
    ).toThrow(RangeError);
    expect(() =>
      serializeReactorTransform({ ...IDENTITY_POSE, scaleX: Number.NaN }),
    ).toThrow(RangeError);
  });
});
