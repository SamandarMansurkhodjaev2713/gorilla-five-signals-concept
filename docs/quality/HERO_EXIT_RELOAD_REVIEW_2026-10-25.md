# Hero exit and reload ownership — 2026-10-25

## Bounded paired comparison

On `984580c`, six fresh contexts ran baseline/candidate interleaved in one
installed Chrome 155.0.8059.85 process: enabled Intel ANGLE/D3D11 compositing,
1440×900, requested CPU ×4. Only the single inline Hero fill declaration changed
through an isolated diagnostic response; no source, runtime, easing or animation
clock was changed during the comparison. Each context verified its response
digest against the frozen build or explicitly derived candidate.

Across three pairs, nine targets and rest/active/end poses, rectangle deltas
were exactly zero. Active/end computed styles and progress matched. At rest,
identity independent transforms became `none` and native progress became `null`,
as intended outside the exit range. Four desktop captures were directly viewed;
this does not assert byte-identical screenshots or all-device visual equivalence.

| Pair | Baseline scene-frame duration | Forward-fill duration | Baseline script | Forward-fill script |
| --- | ---: | ---: | ---: | ---: |
| 1 | 73.2ms | 65.7ms | 67.3ms | 59.8ms |
| 2 | 74.1ms | 70.9ms | 63.9ms | 65.1ms |
| 3 | 66.3ms | 64.2ms | 60.4ms | 57.7ms |

Forced-layout maxima were 20.8/20.4/15.8ms versus 20.0/17.4/16.0ms. One script
and one forced-layout comparison were slightly worse. Treat this as a small
candidate optimization, not a dependable cure or an acceptance pass.

Private raw artifacts: `.tmp/hero-exit-fill-pair-2026-10-25/`. Do not repeat this
experiment until green or remove Full motion to improve its numbers.

## Reload defect and corrective iterations

The new range/reload tests exposed a pre-existing position error. A separate
two-mode diagnostic reproduced `600 → 668px` under both old and candidate CSS,
with a 68px in-flow marker and no custom `gorillaScrollY` field. The marker is
required and remains present. Evidence:
`.tmp/hero-reload-before-fix-2026-10-25.json`.

Capture and validate the actual departing viewport through a one-use same-path
session handoff. A pagehide-only history mutation did not reliably survive
reload; Firefox/WebKit also kept the router field at zero after actual wheel
scrolling. The handoff takes precedence over stale menu metadata, with legacy
custom and Astro fields retained as fallback. Traversal keeps its own policy.

The former unconditional twelve-frame closure also fought subsequent scrolling.
A bounded, generation-owned controller now stops when stable and cancels on
newer input, navigation or teardown. A one-shot runtime-layout signal handles
late Hero geometry without hardcoded height subtraction or arbitrary sleep.
The maximum per correction and existing tolerance remain unchanged. See
[ADR-0007](../decisions/ADR-0007-reload-scroll-ownership.md).

Retained intermediate failures are separate: initial marker/reload failures in
`.tmp/hero-exit-fill-contract-2026-10-25/`, unconditional-loop failures in
`.tmp/hero-reload-contract-2026-10-25/`, and the first owned-loop batch in
`.tmp/owned-scroll-contract-2026-10-25/`. The latter also contained a test-only
cross-realm error: its frame-limit constant was not passed into `page.evaluate`.
That test now receives an explicit serialized argument; no assertion or timeout
was removed. Range sampling now uses real wheel input, followed by native paint
and position checks, rather than programmatically racing an active restoration.

## Five review lenses

1. Correctness: distinguish reload, fresh navigation and traversal; validate
   finite nonnegative coordinates including zero. Capture before live history
   can change, prefer current reload state to stale menu data and consume once.
2. Architecture/lifecycle: a pure parser and small port controller separate
   policy from browser wiring. Invalidate late frames, abort document-owned
   listeners, cancel deferred layout correction and preserve BFCache ownership.
3. UX/accessibility: preserve all content, warning geometry, Full/Lite/Reduced,
   authored exit poses and native scrolling. New user intent wins; no global
   anchoring override, hidden controls or synthetic activation is introduced.
4. Performance/security: no new dependency, service, telemetry or media. Keep
   budgets intact and report the modest/noisy result honestly. Do not substitute
   software WebKit timing for physical Safari performance.
5. Maintainability/release: policy tests cover malformed state, stale frames,
   overlapping requests, unreachable targets and bounded termination. Browser
   tests distinguish supported native exit from fallback. Broader Lighthouse,
   physical-device and public-release acceptance remain separate requirements.

## Input and transport corrections

An independent A/B observed that Locator clicking the already-visible sticky
summary moved the page before pointerdown (Chrome `600 → 142`, WebKit
`600 → 527`), while direct real mouse input at its unchanged viewport center
preserved `600` through the click in both engines. The consumer helper now uses
that measured real pointer path; offscreen triggers still scroll into view.
Menu focus itself now uses `preventScroll`. The source captures position only
when opening, not when closing an already-open summary.

The failed transport batch `.tmp/pagehide-scroll-contract-2026-10-25/` is retained.
Its new history-field assertions were not a reliable cross-document handoff.
The replacement asserts actual restored position and consumption of a bounded,
validated session record. Tests do not require lagging router fields to mirror
the viewport. Current storage behavior is documented in the
[technical client-state inventory](../release/CLIENT_STATE.md).

## Final verification

- `quality:pages` passes: 270 strict-checked files, 248 unit tests, 47-page build,
  formatting/lint, artifact/font/provenance/SBOM verification and dependency
  audit with no known findings. Parser and restoration-controller code are
  included in configured coverage. Transcript:
  `.tmp/quality-session-scroll-2026-10-25.log`.
- **41 browser cases pass**, one worker, no retries. Four pre-existing
  non-Chromium route-lifecycle cases are explicitly skipped, not passed.
  Raw evidence: `.tmp/session-scroll-contract-2026-10-25/` and matching `.log`.
- Coverage includes all-engine reload with stale menu metadata, reload with an
  open menu, newer wheel intent winning, Hero capability cleanup/failure rollback
  and real mouse/touch menu activation. Native exit/restore/reverse runs at
  390×844, 844×390 and 1440×900 in supported Chromium/WebKit; Firefox validates
  the existing fallback. Existing Chromium anchor-focus/history-Back checks pass.

This is not physical Safari, a complete release matrix or new Lighthouse/frame
budget acceptance. The latest complete performance gate still fails on its
dated artifact. The normal lifecycle changes add no new media or dependency;
performance acceptance for the final artifact must be measured separately.
Malformed handoffs currently share the legacy generic lifecycle diagnostic code,
but expose only a classified reason, never the stored record.
