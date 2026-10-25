# ADR-0007: Reload scroll and authored exit ownership

- Status: accepted for scoped implementation; full release acceptance pending
- Date: 2026-10-25

## Context

An interleaved, hardware-composited Chrome diagnostic found identical sampled
Hero geometry when its scroll-exit animation stopped applying backwards fill.
Before the actual exit range, CSS should leave the presentation to the entry
choreography and baseline stylesheet. Active/end scroll poses must remain intact.

New native-scroll verification exposed an unrelated reload defect: both the old
and candidate fill modes restored `600px` as `668px` after insertion of the
required marker. The marker height is variable, so subtracting a fixed value or
disabling anchoring globally is not an acceptable solution.

Existing custom route coordinates serve traversal, but may be stale after menu
interaction followed by further scrolling. A native reload needs its own
validated initial browser coordinate, not an arbitrary later history read.

## Decision

- Use `forwards` for the existing Hero native exit effect. Preserve all its
  keyframes, ranges, GSAP entry poses and supported-engine fallbacks.
- Save the actual departing viewport in a one-use session handoff on nonpersisted
  pagehide. History mutations in that callback did not reliably reach the
  reloaded document; router scroll fields also lagged actual wheel position in
  Firefox/WebKit. Preserve the stored underlying coordinate while a menu is open.
- Use the validated same-path handoff only when Navigation Timing identifies
  `reload`; reject malformed, oversized, negative or non-finite state. Legacy
  custom history and then Astro state remain fallback sources. Fresh navigation
  and traversal keep their existing route-state policy.
- Consume the initial fallback once. A separate one-shot correction may run on
  the actual motion-runtime ready/fallback signal, accounting for late Hero
  geometry. Never use a fixed sleep to manufacture readiness.
- Own restoration through a small port-based controller. Keep the existing
  maximum of 12 frames and 12px correction tolerance per request, stop after
  two stable frames, and invalidate callbacks by generation on cancellation.
- Cancel pending and deferred reload work on newer pointer/touch/wheel/key,
  hash/history or route-preparation intent, and on pagehide. Abort owned input
  listeners when the document leaves without entering BFCache.

Native browser scrolling remains the baseline under ADR-0003. This is not a
smooth-scroll replacement, an animation-clock override, a framework patch or a
change to performance acceptance thresholds. ADR-0006's native transition/error
ownership remains unchanged.

## Local-state contract

`gorilla:reload-scroll:v1` contains only pathname and numeric position. It omits
origin, query, hash, identifiers and content. Remove it before parsing during
the next initialization of this site, even on fresh/different-path navigation;
only a same-path reload may use its position. Storage denial reports the
existing structured lifecycle diagnostic and retains history fallback.
See the [technical client-state inventory](../release/CLIENT_STATE.md).

Menu focus uses `preventScroll`, preserving background position. Automated
consumer-menu tests use a real pointer at the already-visible trigger's measured
center: Locator auto-scrolling was independently observed to move the page
before pointerdown. Offscreen triggers are still reached normally; no forced
click or intercepted activation is introduced.

## Consequences and verification

The reload parser and controller are independently testable without browser
timers. Browser verification must cover marker insertion, stale menu metadata,
later route navigation, forward/reverse exit ranges, capability cleanup and
newer input winning over restoration. Unsupported native-exit engines must
retain real content and their existing fallback, not be counted as native-motion
coverage.

The paired optimization is modest and noisy; it is not a forced-layout cure or
a frame-budget pass. Full performance, browser, device and release requirements
remain open. See [scoped evidence and five review lenses](../quality/HERO_EXIT_RELOAD_REVIEW_2026-10-25.md).
