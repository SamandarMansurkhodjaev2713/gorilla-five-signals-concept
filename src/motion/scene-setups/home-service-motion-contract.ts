export const SERVICE_HEADER_SELECTOR = ".home-service-dock__index header";
export const SERVICE_ROW_SELECTOR = ".home-service-dock__questions details";
export const SERVICE_ACTION_SELECTOR =
  ".home-service-dock__questions > .control";
export const SERVICE_CONTACT_SELECTOR = ".home-service-dock__contact";
export const SERVICE_CONTACT_WORD_SELECTOR = ".home-service-dock__contact-word";
export const SERVICE_CONTACT_COPY_SELECTOR = [
  ".home-service-dock__contact > .type-label",
  ".home-service-dock__contact > strong",
  ".home-service-dock__contact > small",
  ".home-service-dock__contact > b",
  ".home-service-dock__contact > i",
].join(", ");
export const SERVICE_PRESENTATION_SELECTOR = [
  SERVICE_HEADER_SELECTOR,
  SERVICE_ROW_SELECTOR,
  SERVICE_ACTION_SELECTOR,
  SERVICE_CONTACT_SELECTOR,
  SERVICE_CONTACT_WORD_SELECTOR,
  SERVICE_CONTACT_COPY_SELECTOR,
].join(", ");
export const SERVICE_PRESENTATION_PROPERTIES = [
  "clip-path",
  "opacity",
] as const;

export interface HomeServiceTargets {
  readonly header: HTMLElement;
  readonly rows: readonly HTMLElement[];
  readonly action: HTMLElement;
  readonly contact: HTMLElement;
  readonly contactWord: HTMLElement;
  readonly contactCopy: readonly HTMLElement[];
}

function requireTarget(root: HTMLElement, selector: string): HTMLElement {
  const target = root.querySelector<HTMLElement>(selector);
  if (target === null)
    throw new Error(`Home-service motion hook is missing: ${selector}`);
  return target;
}

export function readHomeServiceTargets(root: HTMLElement): HomeServiceTargets {
  return {
    header: requireTarget(root, SERVICE_HEADER_SELECTOR),
    rows: [...root.querySelectorAll<HTMLElement>(SERVICE_ROW_SELECTOR)],
    action: requireTarget(root, SERVICE_ACTION_SELECTOR),
    contact: requireTarget(root, SERVICE_CONTACT_SELECTOR),
    contactWord: requireTarget(root, SERVICE_CONTACT_WORD_SELECTOR),
    contactCopy: [
      ...root.querySelectorAll<HTMLElement>(SERVICE_CONTACT_COPY_SELECTOR),
    ],
  };
}

export function homeServicePresentationTargets(
  targets: HomeServiceTargets,
): readonly HTMLElement[] {
  return [
    targets.header,
    ...targets.rows,
    targets.action,
    targets.contact,
    targets.contactWord,
    ...targets.contactCopy,
  ];
}
