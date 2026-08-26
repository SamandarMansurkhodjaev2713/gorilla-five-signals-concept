import {
  createProductExplorer,
  type ProductExplorerController,
} from "../features/product-explorer/product-explorer-controller";
import { mountProductAtlases } from "../features/products/product-atlas-controller";
import type { AtlasController } from "../features/products/product-atlas-contract";
import type { createLocatorHandoff } from "../features/locator/locator-controller";
import {
  LOCATOR_ROOT_SELECTOR,
  type LocatorController,
} from "../features/locator/locator-contract";
import { publishMotionDiagnostic } from "../motion/diagnostics";
import type {
  createAccessibleMenu,
  AccessibleMenuController,
} from "../motion/navigation-menu";
import {
  createResponsibleEntry,
  hasResponsibleEntryConfirmation,
  type ResponsibleEntryController,
} from "../motion/responsible-entry";
import { runCleanupStack } from "../motion/cleanup-stack";
import {
  createIntentActivation,
  type IntentActivationController,
} from "../motion/intent-activation";
import type { createMotionRuntime, MotionRuntime } from "../motion/runtime";

interface ConfirmedControllerFactories {
  createAccessibleMenu: typeof createAccessibleMenu;
}

type MotionRuntimeFactory = typeof createMotionRuntime;
type LocatorControllerFactory = typeof createLocatorHandoff;

let runtime: MotionRuntime | null = null;
let menuController: AccessibleMenuController | null = null;
let responsibleEntryController: ResponsibleEntryController | null = null;
let productExplorerController: ProductExplorerController | null = null;
let productAtlasController: AtlasController | null = null;
let locatorHandoffController: LocatorController | null = null;
let intentActivationController: IntentActivationController | null = null;
let mountGeneration = 0;
let mounted = false;

function releaseConfirmedControllers(): void {
  const previousControllers = [
    runtime,
    menuController,
    productExplorerController,
    productAtlasController,
    locatorHandoffController,
  ].filter((controller) => controller !== null);
  runtime = null;
  menuController = null;
  productExplorerController = null;
  productAtlasController = null;
  locatorHandoffController = null;
  runCleanupStack(
    previousControllers.map((controller) => (): void => controller.destroy()),
    "One or more page controllers failed to destroy.",
  );
}

function releaseControllers(): void {
  const previousResponsibleEntry = responsibleEntryController;
  const previousIntentActivation = intentActivationController;
  responsibleEntryController = null;
  intentActivationController = null;
  runCleanupStack(
    [
      releaseConfirmedControllers,
      (): void => previousResponsibleEntry?.destroy(),
      (): void => previousIntentActivation?.destroy(),
    ],
    "One or more page controller groups failed to destroy.",
  );
}

async function loadConfirmedControllerFactories(): Promise<ConfirmedControllerFactories> {
  const { createAccessibleMenu } = await import("../motion/navigation-menu");

  return {
    createAccessibleMenu,
  };
}

async function loadLocatorControllerFactory(): Promise<LocatorControllerFactory> {
  const { createLocatorHandoff } =
    await import("../features/locator/locator-controller");
  return createLocatorHandoff;
}

async function loadMotionRuntimeFactory(): Promise<MotionRuntimeFactory> {
  const { createMotionRuntime } = await import("../motion/runtime");
  return createMotionRuntime;
}

function mountProductExplorer(activeGeneration: number): boolean {
  if (!mounted || activeGeneration !== mountGeneration) {
    return false;
  }
  if (productExplorerController !== null) {
    return true;
  }
  try {
    productExplorerController = createProductExplorer(document);
    return true;
  } catch (error: unknown) {
    publishMotionDiagnostic(window, {
      code: "controller-mount-failed",
      message:
        error instanceof Error
          ? error.message
          : "Product explorer startup failed.",
    });
    return false;
  }
}

function mountProductArchive(activeGeneration: number): boolean {
  if (!mounted || activeGeneration !== mountGeneration) {
    return false;
  }
  if (productAtlasController !== null) {
    return true;
  }
  productAtlasController = mountProductAtlases(document);
  return true;
}

function waitForAnimationFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function scheduleMotionRuntime(activeGeneration: number): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      void loadAndMountMotionRuntime(activeGeneration);
    });
  });
}

function mountMotionRuntime(
  activeGeneration: number,
  createMotionRuntime: MotionRuntimeFactory,
): void {
  if (!mounted || activeGeneration !== mountGeneration || runtime !== null) {
    return;
  }

  try {
    const nextRuntime = createMotionRuntime();
    runtime = nextRuntime;
    void nextRuntime.ready.catch((error: unknown): void => {
      if (activeGeneration === mountGeneration) {
        publishMotionDiagnostic(window, {
          code: "engine-load-failed",
          message:
            error instanceof Error ? error.message : "Motion startup failed.",
        });
      }
    });
  } catch (error: unknown) {
    if (activeGeneration === mountGeneration) {
      publishMotionDiagnostic(window, {
        code: "engine-load-failed",
        message:
          error instanceof Error ? error.message : "Motion startup failed.",
      });
    }
  }
}

async function mountFunctionalControllers(
  activeGeneration: number,
): Promise<boolean> {
  if (!mounted || activeGeneration !== mountGeneration) {
    return false;
  }

  try {
    const factories = await loadConfirmedControllerFactories();
    if (!mounted || activeGeneration !== mountGeneration) {
      return false;
    }

    menuController = factories.createAccessibleMenu(document);
    return (
      mountProductExplorer(activeGeneration) &&
      mountProductArchive(activeGeneration)
    );
  } catch (error: unknown) {
    try {
      releaseConfirmedControllers();
    } catch (cleanupError: unknown) {
      publishMotionDiagnostic(window, {
        code: "controller-cleanup-failed",
        message:
          cleanupError instanceof Error
            ? cleanupError.message
            : "Controller cleanup failed.",
      });
    }
    publishMotionDiagnostic(window, {
      code: "controller-mount-failed",
      message:
        error instanceof Error ? error.message : "Controller startup failed.",
    });
    return false;
  }
}

async function mountLocatorController(activeGeneration: number): Promise<void> {
  if (!mounted || activeGeneration !== mountGeneration) {
    return;
  }

  try {
    const createLocatorHandoff = await loadLocatorControllerFactory();
    if (!mounted || activeGeneration !== mountGeneration) {
      return;
    }
    locatorHandoffController = createLocatorHandoff(document);
  } catch (error: unknown) {
    publishMotionDiagnostic(window, {
      code: "controller-mount-failed",
      message:
        error instanceof Error ? error.message : "Locator startup failed.",
    });
  }
}

async function loadAndMountMotionRuntime(
  activeGeneration: number,
): Promise<void> {
  if (!mounted || activeGeneration !== mountGeneration || runtime !== null) {
    return;
  }
  try {
    await waitForAnimationFrame();
    const createMotionRuntime = await loadMotionRuntimeFactory();
    await waitForAnimationFrame();
    mountMotionRuntime(activeGeneration, createMotionRuntime);
  } catch (error: unknown) {
    publishMotionDiagnostic(window, {
      code: "engine-load-failed",
      message:
        error instanceof Error ? error.message : "Motion startup failed.",
    });
  }
}

async function mountConfirmedControllers(
  activeGeneration: number,
): Promise<void> {
  if (await mountFunctionalControllers(activeGeneration)) {
    await loadAndMountMotionRuntime(activeGeneration);
  }
}

function scheduleConfirmedControllers(activeGeneration: number): void {
  mountProductExplorer(activeGeneration);
  mountProductArchive(activeGeneration);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      void mountConfirmedControllers(activeGeneration);
    });
  });
}

function mount(): void {
  releaseControllers();
  const activeGeneration = ++mountGeneration;
  mounted = true;
  const scheduleConfirmed = (): void =>
    scheduleConfirmedControllers(activeGeneration);
  const scheduleMotion = (): void => scheduleMotionRuntime(activeGeneration);
  const hasEntry = document.querySelector("[data-responsible-entry]") !== null;
  const hasLocator = document.querySelector(LOCATOR_ROOT_SELECTOR) !== null;
  const staticQaMode =
    new URL(window.location.href).searchParams.get("motion") === "static";
  if (hasLocator) {
    void mountLocatorController(activeGeneration);
  }
  if (hasEntry) {
    responsibleEntryController = createResponsibleEntry(document, {
      onConfirmed: scheduleConfirmed,
    });
    return;
  }
  void mountFunctionalControllers(activeGeneration);
  if (hasResponsibleEntryConfirmation(window) || staticQaMode) {
    scheduleMotion();
    return;
  }
  intentActivationController = createIntentActivation(document, scheduleMotion);
}

function destroy(): void {
  mountGeneration += 1;
  mounted = false;
  releaseControllers();
}

function start(): void {
  if (mounted) {
    return;
  }

  try {
    mount();
  } catch (error: unknown) {
    publishMotionDiagnostic(window, {
      code: "controller-mount-failed",
      message:
        error instanceof Error ? error.message : "Controller startup failed.",
    });
    destroy();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}

document.addEventListener("astro:before-swap", destroy);
document.addEventListener("astro:page-load", start);
