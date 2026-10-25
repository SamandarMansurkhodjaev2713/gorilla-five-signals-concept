# ADR-0010: Product selection and route history boundaries

Status: accepted integration design; native browser acceptance is required.
Date: 2026-10-25.

## Context

The product explorer originally pushed `{ product }` into native history. Astro's
Window popstate handler also interpreted those entries as route traversals,
replaced the entire document subtree, discarded the existing scene and reset
scroll. Native node-identity and before/after-swap evidence confirmed this was an
actual route replacement, not a transition snapshot failure.

## Decision

- Product entries carry only one application-owned versioned namespace:
  `gorilla:product-explorer` with version, owner pathname and product slug.
- Existing record-shaped state is shallow-copied. Every framework and foreign
  field is retained unchanged; no Astro index, scroll field or private router
  state is invented or advanced by the product controller.
- Runtime guards accept an owned entry only when its version and field types are
  valid, its pathname matches both the controller's construction path and the
  actual current URL, its product matches the URL and its slug is allowlisted.
- A tiny self-hosted classic bootstrap registers the native popstate bridge
  before deferred framework modules execute. It synchronously forwards the actual
  event through `gorilla:before-native-popstate`; the current controller validates
  it and consumes only an owned same-path traversal. A late capture listener alone
  is insufficient at Chromium's Window target, as native evidence demonstrated.
- The bootstrap is external under the unchanged self-only script CSP. It contains
  no selection/schema logic and does not patch history or the router. Its
  AbortController releases listeners on non-persisted pagehide, retaining BFCache
  operation. Astro deduplicates its stable external src across route swaps.
- Controller channel subscriptions remain AbortSignal-owned. Selection itself
  synchronizes product content and locale links through the existing controller.
- Initial framework entries, malformed/foreign state and cross-route traversals
  remain untouched for Astro. Actual route navigation continues using the public
  router and ordinary anchors. No global history monkey patch or private router
  API is introduced.

## Verification and consequences

Pure tests cover malformed state, foreign metadata, no input mutation, mismatched
paths/URL/slug and preservation of framework fields. Native browser tests must
prove same-node selection back/forward without a route swap or scroll reset, plus
normal cross-route anchor/back/forward behavior. A passing selection-only unit
test cannot establish router compatibility.

Framework upgrades must revalidate native ordering, external-script deduplication
and cross-route behavior. The new bootstrap is included in formatting, lint,
strict JavaScript TypeScript checks and transfer budgets. Selection snapshots
belong to their actual DOM instance; tests must
not silently reapply a fixture to hide mutation of an existing node.

See the [transition review and retained history evidence](../quality/REACTOR_TRANSITION_REVIEW_2026-10-25.md).
