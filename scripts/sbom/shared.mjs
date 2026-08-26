export function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function compareCodePoints(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function readString(value, context) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${context} must be a non-empty string.`);
  }
  return value.trim();
}
