export type Cleanup = () => void;

/** Runs every cleanup in reverse ownership order and reports all failures. */
export function runCleanupStack(
  cleanups: readonly Cleanup[],
  failureMessage: string,
): void {
  const errors: unknown[] = [];

  for (const cleanup of [...cleanups].reverse()) {
    try {
      cleanup();
    } catch (error: unknown) {
      errors.push(error);
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, failureMessage);
  }
}
