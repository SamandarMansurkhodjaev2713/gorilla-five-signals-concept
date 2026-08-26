export type SelectionDirection = "next" | "previous";

export function resolveInitialProduct(
  slugs: readonly string[],
  requestedSlug: string | null,
): string | null {
  if (requestedSlug !== null && slugs.includes(requestedSlug)) {
    return requestedSlug;
  }
  return slugs[0] ?? null;
}

export function resolveRelativeProduct(
  slugs: readonly string[],
  selectedSlug: string,
  direction: SelectionDirection,
): string | null {
  if (slugs.length === 0) {
    return null;
  }
  const currentIndex = slugs.indexOf(selectedSlug);
  const baseIndex = currentIndex < 0 ? 0 : currentIndex;
  const offset = direction === "next" ? 1 : -1;
  const nextIndex = (baseIndex + offset + slugs.length) % slugs.length;
  return slugs[nextIndex] ?? null;
}
