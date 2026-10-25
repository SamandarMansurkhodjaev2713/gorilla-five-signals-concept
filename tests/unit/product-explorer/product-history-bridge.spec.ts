import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

import { describe, expect, it, vi } from "vitest";

import { PRODUCT_HISTORY_BRIDGE_EVENT } from "@/features/product-explorer/product-explorer-url";

const BRIDGE_SOURCE = readFileSync(
  new URL("../../../public/scripts/product-history-bridge.js", import.meta.url),
  "utf8",
);

interface BridgeHarness {
  readonly lifecycle: AbortSignal;
  readonly windowValue: EventTarget;
}

function installBridge(): BridgeHarness {
  const windowValue = new EventTarget();
  let lifecycle: AbortSignal | null = null;

  class ObservedAbortController extends AbortController {
    constructor() {
      super();
      lifecycle = this.signal;
    }
  }

  runInNewContext(BRIDGE_SOURCE, {
    AbortController: ObservedAbortController,
    CustomEvent,
    window: windowValue,
  });
  if (lifecycle === null) {
    throw new Error("History bridge did not create its lifecycle owner.");
  }
  return { lifecycle, windowValue };
}

function pageHide(persisted: boolean): Event {
  return Object.assign(new Event("pagehide"), { persisted });
}

function eventDetail(event: Event): unknown {
  return Reflect.get(event, "detail");
}

describe("product history classic bridge", () => {
  it("GIVEN a native popstate WHEN the bridge receives it THEN the imported app channel synchronously receives the exact event object", () => {
    const harness = installBridge();
    const order: string[] = [];
    let forwarded: unknown;
    harness.windowValue.addEventListener(
      PRODUCT_HISTORY_BRIDGE_EVENT,
      (event) => {
        order.push("app-channel");
        forwarded = eventDetail(event);
      },
    );
    const nativeEvent = new Event("popstate");

    order.push("before-native-dispatch");
    harness.windowValue.dispatchEvent(nativeEvent);
    order.push("after-native-dispatch");

    expect(forwarded).toBe(nativeEvent);
    expect(order).toEqual([
      "before-native-dispatch",
      "app-channel",
      "after-native-dispatch",
    ]);
  });

  it("GIVEN the app channel stops the forwarded native event WHEN a router registered later awaits popstate THEN that router stays blocked", () => {
    const harness = installBridge();
    const router = vi.fn();
    let forwarded: unknown;
    harness.windowValue.addEventListener(
      PRODUCT_HISTORY_BRIDGE_EVENT,
      (event) => {
        forwarded = eventDetail(event);
        if (forwarded instanceof Event) forwarded.stopImmediatePropagation();
      },
    );
    harness.windowValue.addEventListener("popstate", router);
    const nativeEvent = new Event("popstate");

    harness.windowValue.dispatchEvent(nativeEvent);

    expect(forwarded).toBe(nativeEvent);
    expect(router).not.toHaveBeenCalled();
  });

  it("GIVEN a non-persisted pagehide WHEN lifecycle ownership ends THEN the shared signal aborts both window listeners and forwarding cannot resume", () => {
    const harness = installBridge();
    const appChannel = vi.fn();
    harness.windowValue.addEventListener(
      PRODUCT_HISTORY_BRIDGE_EVENT,
      appChannel,
    );

    harness.windowValue.dispatchEvent(pageHide(false));
    harness.windowValue.dispatchEvent(new Event("popstate"));
    harness.windowValue.dispatchEvent(pageHide(false));
    harness.windowValue.dispatchEvent(new Event("popstate"));

    expect(harness.lifecycle.aborted).toBe(true);
    expect(appChannel).not.toHaveBeenCalled();
  });

  it("GIVEN a persisted pagehide WHEN the page later resumes THEN the bridge remains active until a non-persisted pagehide releases it", () => {
    const harness = installBridge();
    const forwarded: unknown[] = [];
    harness.windowValue.addEventListener(
      PRODUCT_HISTORY_BRIDGE_EVENT,
      (event) => forwarded.push(eventDetail(event)),
    );
    const resumedEvent = new Event("popstate");

    harness.windowValue.dispatchEvent(pageHide(true));
    harness.windowValue.dispatchEvent(resumedEvent);
    harness.windowValue.dispatchEvent(pageHide(false));
    harness.windowValue.dispatchEvent(new Event("popstate"));

    expect(forwarded).toEqual([resumedEvent]);
    expect(harness.lifecycle.aborted).toBe(true);
  });
});
