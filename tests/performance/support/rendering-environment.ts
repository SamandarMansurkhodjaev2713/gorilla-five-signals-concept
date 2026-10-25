import process from "node:process";

import { z } from "zod";

export const GPU_INFO_TIMEOUT_MS = 10_000;

interface RenderingSession {
  send(method: "SystemInfo.getInfo"): Promise<unknown>;
  detach(): Promise<void>;
}

export interface BrowserRenderingSource {
  newBrowserCDPSession(): Promise<RenderingSession>;
  version(): string;
}

type ReadOutcome = { kind: "success" } | { kind: "failure"; cause: unknown };

async function detachRenderingSession(
  session: RenderingSession,
  outcome: ReadOutcome,
): Promise<void> {
  try {
    await session.detach();
  } catch (cleanupError: unknown) {
    if (outcome.kind === "failure")
      throw new AggregateError(
        [outcome.cause, cleanupError],
        "Rendering metadata and session cleanup both failed.",
        { cause: cleanupError },
      );
    throw cleanupError;
  }
}

const systemInfoSchema = z.object({
  gpu: z.object({
    featureStatus: z.object({ gpu_compositing: z.string().min(1) }),
    auxAttributes: z.object({
      glRenderer: z.string().min(1),
      glVendor: z.string().min(1),
    }),
  }),
});

async function requestGpuInfo(session: RenderingSession): Promise<unknown> {
  let deadline: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      session.send("SystemInfo.getInfo"),
      new Promise<never>((_, reject) => {
        deadline = setTimeout(
          () => reject(new Error("Browser GPU metadata request timed out.")),
          GPU_INFO_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (deadline !== undefined) clearTimeout(deadline);
  }
}

/** Capture only rendering context, without profile paths, debugger tokens or user data. */
export async function readBrowserRenderingEnvironment(
  browser: BrowserRenderingSource,
) {
  const session = await browser.newBrowserCDPSession();
  let outcome: ReadOutcome = { kind: "success" };
  try {
    const info = systemInfoSchema.parse(await requestGpuInfo(session));
    return {
      platform: process.platform,
      browserVersion: browser.version(),
      gpuCompositing: info.gpu.featureStatus.gpu_compositing,
      renderer: info.gpu.auxAttributes.glRenderer,
      vendor: info.gpu.auxAttributes.glVendor,
    };
  } catch (cause: unknown) {
    outcome = { kind: "failure", cause };
    throw cause;
  } finally {
    await detachRenderingSession(session, outcome);
  }
}
