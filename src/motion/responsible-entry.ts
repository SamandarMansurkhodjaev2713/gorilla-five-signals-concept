import { publishMotionDiagnostic } from "./diagnostics";
import {
  createMotionPreferenceController,
  type MotionPreferenceController,
} from "./preference-controller";

const CONFIRMATION_KEY = "gorilla-responsible-entry-confirmed";
const ENTRY_SELECTOR = "[data-responsible-entry]";
const CONTINUE_SELECTOR = "[data-responsible-continue]";
const LEAVE_SELECTOR = "[data-responsible-leave]";
const MARKER_SELECTOR = "[data-responsible-marker]";
const RELEASE_SELECTOR = "[data-entry-release]";
const MAIN_SELECTOR = "main#main-content";
const RELEASE_DURATION_MS = 540;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ResponsibleEntryController {
  destroy(): void;
}

export interface ResponsibleEntryOptions {
  readonly onConfirmed: () => void;
}

function storageFailure(windowValue: Window, error: unknown): void {
  publishMotionDiagnostic(windowValue, {
    code: "entry-storage-failed",
    message:
      error instanceof Error
        ? error.message
        : "Responsible-entry storage is unavailable.",
  });
}

export function hasResponsibleEntryConfirmation(windowValue: Window): boolean {
  try {
    return windowValue.sessionStorage.getItem(CONFIRMATION_KEY) === "true";
  } catch (error: unknown) {
    storageFailure(windowValue, error);
    return false;
  }
}

function rememberSessionConfirmation(windowValue: Window): void {
  try {
    windowValue.sessionStorage.setItem(CONFIRMATION_KEY, "true");
  } catch (error: unknown) {
    storageFailure(windowValue, error);
  }
}

function revealMarker(marker: HTMLElement): void {
  marker.dataset.markerVisible = "true";
  marker.removeAttribute("aria-hidden");
}

function activateRelease(release: HTMLElement): void {
  release.dataset.releaseActive = "true";
}

function deactivateRelease(release: HTMLElement): void {
  delete release.dataset.releaseActive;
}

function openModalDialog(dialog: HTMLDialogElement): void {
  if (dialog.open) {
    dialog.close();
  }
  dialog.showModal();
}

function mountEntryPreferenceControls(
  documentValue: Document,
  windowValue: Window,
): MotionPreferenceController {
  return createMotionPreferenceController({
    documentValue,
    windowValue,
    onChange: (): void => undefined,
  });
}

function trapDialogFocus(
  event: KeyboardEvent,
  dialog: HTMLDialogElement,
  fallback: HTMLElement,
): void {
  if (event.key !== "Tab") {
    return;
  }
  const focusable = Array.from(
    dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
  const first = focusable.at(0) ?? fallback;
  const last = focusable.at(-1) ?? fallback;
  if (event.shiftKey && dialog.ownerDocument.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && dialog.ownerDocument.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function createResponsibleEntry(
  root: ParentNode,
  options: ResponsibleEntryOptions,
): ResponsibleEntryController {
  const dialog = root.querySelector<HTMLDialogElement>(ENTRY_SELECTOR);
  const marker = root.querySelector<HTMLElement>(MARKER_SELECTOR);
  const continueButton =
    dialog?.querySelector<HTMLButtonElement>(CONTINUE_SELECTOR) ?? null;
  const leaveLink = dialog?.querySelector<HTMLAnchorElement>(LEAVE_SELECTOR);
  const release = root.querySelector<HTMLElement>(RELEASE_SELECTOR);
  const abortController = new AbortController();
  const documentValue = dialog?.ownerDocument ?? null;
  const windowValue =
    dialog?.ownerDocument.defaultView ??
    marker?.ownerDocument.defaultView ??
    null;
  let confirmationPublished = false;
  let entryPreferenceController: MotionPreferenceController | null = null;
  let postConfirmationFrame: number | null = null;
  let releaseTimer: number | null = null;
  const releaseEntryPreference = (): void => {
    entryPreferenceController?.destroy();
    entryPreferenceController = null;
  };
  const publishConfirmation = (): void => {
    if (confirmationPublished) {
      return;
    }
    confirmationPublished = true;
    options.onConfirmed();
  };

  if (!dialog || !marker || !continueButton || !windowValue || !documentValue) {
    publishConfirmation();
    return {
      destroy(): void {
        abortController.abort();
      },
    };
  }

  if (hasResponsibleEntryConfirmation(windowValue)) {
    if (dialog.open) {
      dialog.close();
    }
    revealMarker(marker);
    publishConfirmation();
  } else {
    entryPreferenceController = mountEntryPreferenceControls(
      documentValue,
      windowValue,
    );
    openModalDialog(dialog);
    if (!dialog.contains(documentValue.activeElement)) {
      continueButton.focus({ preventScroll: true });
    }
  }

  documentValue.addEventListener(
    "focusin",
    (event): void => {
      if (
        dialog.open &&
        event.target instanceof Node &&
        !dialog.contains(event.target)
      ) {
        continueButton.focus({ preventScroll: true });
      }
    },
    { capture: true, signal: abortController.signal },
  );
  documentValue.addEventListener(
    "click",
    (event): void => {
      if (
        dialog.open &&
        event.target instanceof Node &&
        !dialog.contains(event.target)
      ) {
        event.preventDefault();
        event.stopPropagation();
        continueButton.focus({ preventScroll: true });
      }
    },
    { capture: true, signal: abortController.signal },
  );
  documentValue.addEventListener(
    "keydown",
    (event): void => {
      if (!dialog.open) {
        return;
      }
      trapDialogFocus(event, dialog, continueButton);
    },
    { capture: true, signal: abortController.signal },
  );

  dialog.addEventListener(
    "cancel",
    (event): void => {
      event.preventDefault();
      (leaveLink ?? continueButton).focus({ preventScroll: true });
    },
    { signal: abortController.signal },
  );

  continueButton.addEventListener(
    "click",
    (): void => {
      rememberSessionConfirmation(windowValue);
      releaseEntryPreference();
      dialog.close();
      if (release !== null) {
        activateRelease(release);
        releaseTimer = windowValue.setTimeout((): void => {
          releaseTimer = null;
          deactivateRelease(release);
        }, RELEASE_DURATION_MS);
      }
      publishConfirmation();
      postConfirmationFrame = windowValue.requestAnimationFrame((): void => {
        postConfirmationFrame = windowValue.requestAnimationFrame((): void => {
          postConfirmationFrame = null;
          if (abortController.signal.aborted) {
            return;
          }
          revealMarker(marker);
          root
            .querySelector<HTMLElement>(MAIN_SELECTOR)
            ?.focus({ preventScroll: true });
        });
      });
    },
    { signal: abortController.signal },
  );

  return {
    destroy(): void {
      abortController.abort();
      releaseEntryPreference();
      if (postConfirmationFrame !== null) {
        windowValue.cancelAnimationFrame(postConfirmationFrame);
        postConfirmationFrame = null;
      }
      if (releaseTimer !== null) {
        windowValue.clearTimeout(releaseTimer);
        releaseTimer = null;
      }
      if (release !== null) {
        deactivateRelease(release);
      }
      if (dialog.open) {
        dialog.close();
      }
    },
  };
}
