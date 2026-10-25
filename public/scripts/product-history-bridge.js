(() => {
  const PRODUCT_HISTORY_BRIDGE_EVENT = "gorilla:before-native-popstate";
  const windowValue = globalThis.window;
  const lifecycle = new globalThis.AbortController();
  const listenerOptions = { signal: lifecycle.signal };

  windowValue.addEventListener(
    "popstate",
    (nativeEvent) => {
      windowValue.dispatchEvent(
        new globalThis.CustomEvent(PRODUCT_HISTORY_BRIDGE_EVENT, {
          detail: nativeEvent,
        }),
      );
    },
    listenerOptions,
  );

  windowValue.addEventListener(
    "pagehide",
    (event) => {
      if (!event.persisted) lifecycle.abort();
    },
    listenerOptions,
  );
})();
