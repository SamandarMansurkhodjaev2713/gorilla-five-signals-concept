function footerTarget(name: string): HTMLElement {
  const port = { name };
  // TYPE-EXCEPTION: Plan tests preserve opaque target identity and never read
  // an unimplemented DOM property from this fixture.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return port as unknown as HTMLElement;
}

export function createFooterSignals(count = 6): readonly HTMLElement[] {
  return Array.from({ length: count }, (_, index) =>
    footerTarget(`signal-${String(index)}`),
  );
}

export function createFooterCopy(): HTMLElement {
  return footerTarget("copy");
}
