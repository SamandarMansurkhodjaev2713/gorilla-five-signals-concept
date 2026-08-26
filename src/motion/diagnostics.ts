export const MOTION_DIAGNOSTIC_EVENT = "gorilla:motion-diagnostic";

export type MotionDiagnosticCode =
  | "controller-contract-invalid"
  | "controller-cleanup-failed"
  | "controller-mount-failed"
  | "engine-load-failed"
  | "entry-storage-failed"
  | "scene-mount-failed"
  | "scene-cleanup-failed"
  | "preference-storage-failed";

export interface MotionDiagnostic {
  readonly code: MotionDiagnosticCode;
  readonly message: string;
  readonly sceneId?: string;
}

export function publishMotionDiagnostic(
  target: Window,
  diagnostic: MotionDiagnostic,
): void {
  target.dispatchEvent(
    new CustomEvent<MotionDiagnostic>(MOTION_DIAGNOSTIC_EVENT, {
      detail: diagnostic,
    }),
  );
}
