import { createSceneSetupContext } from "./owned-scene-context";
import { runSetupStageQueue, type SetupStage } from "./setup-stage-queue";

import type { SceneResources } from "./owned-scene-resources";

/** Accept stages only while the synchronous scene setup transaction is open. */
export function createSetupRegistration(
  options: Omit<Parameters<typeof createSceneSetupContext>[0], "stage">,
) {
  const stages: SetupStage[] = [];
  let registrationOpen = true;
  const context = createSceneSetupContext({
    ...options,
    stage: (callback): void => {
      if (!registrationOpen)
        throw new Error("Setup stage registration is closed.");
      stages.push(callback);
    },
  });
  return {
    context,
    stages,
    close: (): void => {
      registrationOpen = false;
    },
  };
}

function runOwnedSetupStage(
  resources: SceneResources,
  stage: SetupStage,
): void {
  const result: {
    outcome: { kind: "success" } | { kind: "failure"; cause: unknown };
  } = { outcome: { kind: "success" } };
  resources.runOwned((): void => {
    try {
      stage();
    } catch (cause: unknown) {
      // GSAP must restore its ambient context before owned rollback can run.
      result.outcome = { kind: "failure", cause };
    }
  });
  if (result.outcome.kind === "failure") throw result.outcome.cause;
}

/** Await every frame stage and route exceptions through the scene's owned rollback. */
export function activateSetupStages(options: {
  readonly stages: readonly SetupStage[];
  readonly resources: SceneResources;
  readonly windowValue: Window;
  readonly onFailure: (cause: unknown) => never;
}): Promise<void> {
  return runSetupStageQueue({
    stages: options.stages,
    signal: options.resources.signal,
    requestFrame: (callback) =>
      options.windowValue.requestAnimationFrame(callback),
    cancelFrame: (id) => options.windowValue.cancelAnimationFrame(id),
    execute: (stage): void => runOwnedSetupStage(options.resources, stage),
  }).catch(options.onFailure);
}
