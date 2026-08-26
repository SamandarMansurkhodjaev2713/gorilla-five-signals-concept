import {
  observeMotionCapability,
  type CapabilityController,
  type UserMotionPreference,
} from "../capability-policy";
import { publishMotionDiagnostic } from "../diagnostics";
import { loadMotionEngine, type MotionEngine } from "../motion-engine";
import {
  createMotionPreferenceController,
  type MotionPreferenceController,
} from "../preference-controller";
import type { MotionCapability } from "../scene-contract";
import { waitForCriticalRender } from "./critical-render";
import {
  MOTION_RUNTIME_READY_EVENT,
  type MotionRuntime,
  type MotionRuntimeOptions,
  type MotionRuntimeState,
} from "./runtime-contract";
import {
  errorMessage,
  FALLBACK_CAPABILITY,
  INITIAL_CAPABILITY,
  sameCapability,
} from "./runtime-support";
import {
  createEnhancedEnvironment,
  createReducedEnvironment,
  type MotionSceneEnvironment,
} from "./scene-environment";

export class MotionRuntimeCoordinator implements MotionRuntime {
  readonly ready: Promise<void>;
  private readonly documentValue: Document;
  private readonly windowValue: Window;
  private readonly staticQaMode: boolean;
  private readonly startupController = new AbortController();
  private readonly criticalRenderReady: Promise<void>;
  private readonly preferenceController: MotionPreferenceController;
  private readonly capabilityController: CapabilityController;
  private environment: MotionSceneEnvironment | null = null;
  private capability = INITIAL_CAPABILITY;
  private preference: UserMotionPreference = "system";
  private generation = 0;
  private destroyed = false;

  constructor(options: MotionRuntimeOptions) {
    this.documentValue = options.documentValue ?? document;
    this.windowValue = options.windowValue ?? window;
    this.staticQaMode =
      new URL(this.windowValue.location.href).searchParams.get("motion") ===
      "static";
    this.setRuntimeState("loading");
    this.criticalRenderReady = waitForCriticalRender(
      this.documentValue,
      this.windowValue,
      this.startupController.signal,
    );
    const observerRef: { current: CapabilityController | null } = {
      current: null,
    };
    this.preferenceController = this.createPreferenceController(observerRef);
    this.preference = this.preferenceController.current();
    if (this.staticQaMode) {
      this.documentValue.documentElement.dataset.motionStatic = "true";
    }
    this.capabilityController = this.createCapabilityController();
    observerRef.current = this.capabilityController;
    this.ready = this.rebuildSafely(this.capabilityController.current());
  }

  currentCapability(): MotionCapability {
    return this.capability;
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.generation += 1;
    this.startupController.abort();
    this.preferenceController.destroy();
    this.capabilityController.destroy();
    this.releaseEnvironment();
    delete this.documentValue.documentElement.dataset.motionTier;
    delete this.documentValue.documentElement.dataset.motionReason;
    delete this.documentValue.documentElement.dataset.motionStatic;
    this.setRuntimeState("destroyed");
  }

  private createPreferenceController(observerRef: {
    current: CapabilityController | null;
  }): MotionPreferenceController {
    return createMotionPreferenceController({
      documentValue: this.documentValue,
      windowValue: this.windowValue,
      onChange: (next): void => {
        this.preference = next;
        observerRef.current?.refresh();
      },
    });
  }

  private createCapabilityController(): CapabilityController {
    return observeMotionCapability({
      windowValue: this.windowValue,
      navigatorValue: this.windowValue.navigator,
      userPreference: (): UserMotionPreference =>
        this.staticQaMode ? "reduced" : this.preference,
      onChange: (next): void => {
        void this.rebuildSafely(next);
      },
    });
  }

  private setTier(next: MotionCapability): void {
    this.capability = next;
    this.documentValue.documentElement.dataset.motionTier = next.kind;
    this.documentValue.documentElement.dataset.motionReason = next.reason;
  }

  private setRuntimeState(next: MotionRuntimeState): void {
    this.documentValue.documentElement.dataset.motionRuntimeState = next;
    if (next === "ready" || next === "fallback") {
      this.windowValue.dispatchEvent(
        new CustomEvent<MotionRuntimeState>(MOTION_RUNTIME_READY_EVENT, {
          detail: next,
        }),
      );
    }
  }

  private report(sceneId: string | undefined, error: unknown): void {
    publishMotionDiagnostic(this.windowValue, {
      code: sceneId ? "scene-mount-failed" : "scene-cleanup-failed",
      message: errorMessage(error, "Scene mount failed."),
      ...(sceneId ? { sceneId } : {}),
    });
  }

  private releaseEnvironment(): void {
    const previous = this.environment;
    this.environment = null;
    try {
      previous?.destroy();
    } catch (error: unknown) {
      this.report(undefined, error);
    }
  }

  private isStale(activeGeneration: number): boolean {
    return this.destroyed || activeGeneration !== this.generation;
  }

  private applyFallback(error: unknown): void {
    this.setTier(FALLBACK_CAPABILITY);
    this.releaseEnvironment();
    this.environment = createReducedEnvironment(this.documentValue);
    this.setRuntimeState("fallback");
    publishMotionDiagnostic(this.windowValue, {
      code: "engine-load-failed",
      message: errorMessage(error, "Motion engine load failed."),
    });
  }

  private async loadEngine(
    activeGeneration: number,
  ): Promise<MotionEngine | null> {
    try {
      return await loadMotionEngine();
    } catch (error: unknown) {
      if (!this.isStale(activeGeneration)) {
        this.applyFallback(error);
      }
      return null;
    }
  }

  private async rebuild(next: MotionCapability): Promise<void> {
    const activeGeneration = ++this.generation;
    this.setRuntimeState("loading");
    this.setTier(next);
    this.releaseEnvironment();
    if (next.kind === "reduced") {
      this.environment = createReducedEnvironment(this.documentValue);
      this.setRuntimeState("ready");
      return;
    }
    await this.criticalRenderReady;
    if (this.isStale(activeGeneration)) {
      return;
    }
    const engine = await this.loadEngine(activeGeneration);
    if (!engine || this.isStale(activeGeneration)) {
      return;
    }
    const nextEnvironment = await createEnhancedEnvironment({
      documentValue: this.documentValue,
      capability: next,
      engine,
      report: (sceneId, error): void => this.report(sceneId, error),
    });
    if (this.isStale(activeGeneration)) {
      nextEnvironment.destroy();
      return;
    }
    this.environment = nextEnvironment;
    this.setRuntimeState("ready");
  }

  private async rebuildSafely(next: MotionCapability): Promise<void> {
    try {
      await this.rebuild(next);
    } catch (error: unknown) {
      if (!this.destroyed && sameCapability(next, this.capability)) {
        this.applyFallback(error);
      }
    }
  }
}
