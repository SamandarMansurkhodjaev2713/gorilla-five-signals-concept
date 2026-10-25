const GSAP_PRECISION_FACTOR = 100_000;
const MATRIX_SINGULARITY_TOLERANCE = 1e-12;
const HALF_TURN_DEGREES = 180;
const FULL_TURN_DEGREES = 360;
const AUTO_PERCENT = -50;

export interface Matrix2D {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly e: number;
  readonly f: number;
}

export interface TransformPose {
  readonly x: number;
  readonly y: number;
  readonly xPercent: number;
  readonly yPercent: number;
  readonly rotationDegrees: number;
  readonly skewXDegrees: number;
  readonly scaleX: number;
  readonly scaleY: number;
}

function gsapRound(value: number): number {
  return Math.round(value * GSAP_PRECISION_FACTOR) / GSAP_PRECISION_FACTOR || 0;
}

function assertFiniteValues(label: string, values: readonly number[]): void {
  if (values.some((value) => !Number.isFinite(value))) {
    throw new RangeError(`${label} must contain only finite numbers.`);
  }
}

function normalizeMatrix(matrix: Matrix2D): Matrix2D {
  if (Reflect.get(matrix, "is2D") === false) {
    throw new RangeError("Reactor transform matrix must be two-dimensional.");
  }
  const values = [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f];
  assertFiniteValues("Reactor transform matrix", values);
  return {
    a: gsapRound(matrix.a),
    b: gsapRound(matrix.b),
    c: gsapRound(matrix.c),
    d: gsapRound(matrix.d),
    e: gsapRound(matrix.e),
    f: gsapRound(matrix.f),
  };
}

function assertSupportedMatrix(matrix: Matrix2D): void {
  const determinant = matrix.a * matrix.d - matrix.b * matrix.c;
  if (
    !Number.isFinite(determinant) ||
    Math.abs(determinant) <= MATRIX_SINGULARITY_TOLERANCE
  ) {
    throw new RangeError("Reactor transform matrix must be non-singular.");
  }
}

function autoPercent(translation: number, size: number): number {
  return translation !== 0 && Math.round(size / 2) === Math.round(-translation)
    ? AUTO_PERCENT
    : 0;
}

function normalizeReflection(
  rotationDegrees: number,
  skewXDegrees: number,
  scaleY: number,
): Pick<TransformPose, "rotationDegrees" | "scaleY" | "skewXDegrees"> {
  const absoluteSkew = Math.abs(skewXDegrees);
  if (
    absoluteSkew <= HALF_TURN_DEGREES / 2 ||
    absoluteSkew >= FULL_TURN_DEGREES - HALF_TURN_DEGREES / 2
  ) {
    return { rotationDegrees, scaleY, skewXDegrees };
  }
  return {
    rotationDegrees,
    scaleY: -scaleY,
    skewXDegrees:
      skewXDegrees +
      (skewXDegrees <= 0 ? HALF_TURN_DEGREES : -HALF_TURN_DEGREES),
  };
}

/** Decompose a computed 2D matrix using the installed GSAP CSSPlugin rules. */
export function decomposeReactorTransform(
  matrix: Matrix2D,
  box: { readonly width: number; readonly height: number },
): TransformPose {
  assertFiniteValues("Reactor transform box", [box.width, box.height]);
  if (box.width < 0 || box.height < 0) {
    throw new RangeError(
      "Reactor transform box dimensions cannot be negative.",
    );
  }
  const value = normalizeMatrix(matrix);
  assertSupportedMatrix(value);
  const rotationDegrees =
    Math.atan2(value.b, value.a) * (HALF_TURN_DEGREES / Math.PI);
  const rawSkew =
    Math.atan2(value.c, value.d) * (HALF_TURN_DEGREES / Math.PI) +
    rotationDegrees;
  const reflected = normalizeReflection(
    rotationDegrees,
    rawSkew,
    Math.hypot(value.d, value.c) *
      Math.abs(Math.cos(rawSkew * (Math.PI / HALF_TURN_DEGREES))),
  );
  const xPercent = autoPercent(value.e, box.width);
  const yPercent = autoPercent(value.f, box.height);
  return {
    x: value.e - (box.width * xPercent) / 100,
    y: value.f - (box.height * yPercent) / 100,
    xPercent,
    yPercent,
    rotationDegrees: gsapRound(reflected.rotationDegrees),
    skewXDegrees: reflected.skewXDegrees,
    scaleX: gsapRound(Math.hypot(value.a, value.b)),
    scaleY: gsapRound(reflected.scaleY),
  };
}

function serializeNumber(value: number): string {
  return String(Object.is(value, -0) ? 0 : value);
}

/** Serialize component keyframes in the same transform order as GSAP. */
export function serializeReactorTransform(pose: TransformPose): string {
  const values = [
    pose.x,
    pose.y,
    pose.xPercent,
    pose.yPercent,
    pose.rotationDegrees,
    pose.skewXDegrees,
    pose.scaleX,
    pose.scaleY,
  ];
  assertFiniteValues("Reactor transform pose", values);
  const number = serializeNumber;
  return [
    `translate(${number(pose.xPercent)}%, ${number(pose.yPercent)}%)`,
    `translate3d(${number(pose.x)}px, ${number(pose.y)}px, 0px)`,
    `rotate(${number(pose.rotationDegrees)}deg)`,
    `skew(${number(pose.skewXDegrees)}deg, 0deg)`,
    `scale(${number(pose.scaleX)}, ${number(pose.scaleY)})`,
  ].join(" ");
}
