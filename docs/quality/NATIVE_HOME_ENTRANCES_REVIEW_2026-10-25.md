# Native home entrances: five-lens review

Status: source and artifact gates pass; final runtime acceptance remains open.

## Outcome and scope

Move the finite Manifesto and Tashkent Terminal entrances onto the same guarded
native player and entrance owner already used by Reactor and Material Film.
Preserve the complete Full/Lite choreography, exact CSS baseline, reduced/no-JS
paths and scoped GSAP fallback. Replace the rejected uniform easing sampling
with bounded adaptive curves, then remove repeated parsing of identical effects
through operation-local public `KeyframeEffect` copies.

Current entry SHA-256:
`577dd60a1cd70b3a56c84d003b2a892019eb5d5fdfc5e87389f079de7840434b`.

## 1. Correctness and edge cases

Each scene has an explicit cue plan driven by the same named motion
specification as its GSAP fallback. Manifesto keeps its 1250ms terminal time;
Material Film keeps ten cues and 640ms; Terminal keeps 21 Full and six Lite cues
and its authored 1120/860ms terminal times. Native effects are constructed idle,
then start from one validated document-clock origin.

The shared owner handles unsupported capability, partial native setup,
synchronous completion, repeated start/destroy, late callbacks and fallback
failure. It cancels only its own effects or nested GSAP context, then restores
the exact captured inline declarations and priorities. Failure and cleanup
causes are aggregated rather than swallowed.

Effect reuse is deliberately narrower than browser-valid keyframes. Only plain,
finite, descriptor-safe data can form a key; unsafe values bypass the cache and
remain subject to the browser constructor's validation. Regression tests prove
that `NaN` cannot collide with a valid `null` offset and that an accessor is
evaluated only by the original constructor, without target or timing mutation.
The cache and all cloned effects die with the one player construction pass.

## 2. Architecture, coupling and cleanup

`FiniteAnimationPlayer` owns effect allocation, common clock, completion and
cancellation. `FiniteEntranceOwner` owns native/fallback selection, exact
snapshot cleanup and failure reporting. Scene modules provide only typed targets,
plans, motion specifications and thin adapters; neither neutral owner imports a
feature selector.

Adaptive easing is generated in the neutral motion layer. The copy path uses
only the standardized `KeyframeEffect` copy constructor, settable `target` and
`updateTiming()`; it does not access GSAP caches or browser internals. The local
Map excludes delay, role and target from its key because those values are applied
per clone. It includes frames, duration and easing, so semantically different
effects cannot share a source.

No cross-operation cache was introduced. This avoids stale target retention,
cross-document objects, route-lifetime coupling and teardown ordering hazards.
Unexpected capability errors still fail visibly; only the known unsupported
surface selects the verified GSAP path.

## 3. UX, responsive behavior and accessibility

Full and Lite retain their authored target order, timing, easing and end state.
Reduced motion and no-JS remain readable CSS, not a hidden or delayed variant.
The implementation does not alter semantics, focus order, pointer handling,
copy, media policy or responsive breakpoints.

A 12-case native lifecycle run passed in Chromium, Firefox and WebKit across
Full/Lite and 390/1440px before the final copy-key hardening. The observer wraps
the real browser `Animation` constructor and records real start/finish/cancel
events; it does not pause, seek, replace effects or claim frame-rate evidence.
That avoids the earlier WebKit race where a 640ms Film entrance could finish
between wheel activation and a later `getAnimations()` sample.

The first adaptive parity matrix exposed a real WebKit 390px natural-cleanup
rebalance under `text-wrap: balance`. A controlled eight-case WebKit experiment
with `wrap` produced zero differences, stable line counts at start/mid/end/natural
cleanup and maximum rect delta 0.0111px. The production heading now uses that
stable policy; the failed pre-correction matrix is retained, not overwritten.

The final current-hash matrix passes 24 scene comparisons (12 matched backend
pairs × two scenes) and 48 scene/backend captures across Chromium, Firefox and
WebKit, Full/Lite and 390/1440px with zero differences. Natural cleanup passes
48/48, exact eight-declaration inline restoration passes 24/24, font metadata
matches and no page/cleanup error is recorded. Maximum
deltas are 0.0167px rect, 0.000073 opacity, 0.00004 matrix linear, 0.000782px
matrix translation and 0.054px clip, all within unchanged bounds. Controlled
seeking and rewind/play prove parity and cleanup, not native input or FPS.

## 4. Performance, security and dependency risk

The rejected uniform 513-stop candidate measured these observer callbacks on
hardware Chrome at CPU×4, in milliseconds:

| Scene             |  Run 1 |  Run 2 |  Run 3 |
| ----------------- | -----: | -----: | -----: |
| Manifesto         | 17.399 | 19.194 | 16.481 |
| Material Film     | 16.548 | 15.672 | 12.234 |
| Tashkent Terminal | 23.309 | 20.412 | 24.595 |

Adaptive sampling kept the dense 3840px clip error below 0.25px and reduced the
same callbacks to 9.937/11.681/13.213ms, 5.744/6.904/13.057ms and
10.909/20.806/14.304ms respectively. Every target callback had zero nested
style-tree updates and layouts. The single 20.806ms Terminal breach motivated
batch-local effect copies; it was not reclassified as acceptable.

The following copy-reuse artifact measures Manifesto at
17.801/13.098/21.664ms, Material at 6.530/5.967/5.659ms and Terminal at
7.952/13.064/4.176ms. All nine callbacks contain zero nested style-tree updates
and layouts. Manifesto nevertheless fails two runs. Compared with the adaptive
pre-reuse sample, the result is an uneven cross-run tradeoff rather than isolated
causal evidence that copy construction improved total callback work.

This trace predates the final unsafe-frame bypass correction. All production
cues have reusable keys, so it is relevant diagnostic evidence, but it is not
current-hash acceptance. Three still-unattributed Product/Store/Contact boundary
callbacks reach 27.819/14.747/18.704ms, 35.900/29.193/6.651ms and
45.679/11.557/18.882ms; the boundary labels do not prove exact feature
ownership. No scene-local result can waive complete-journey or Lighthouse gates.

The implementation adds no dependency, network call, user data, storage,
endpoint or CSP change. It allocates a bounded Map per finite plan and releases
it after construction. Inputs are internal typed plans; unsupported or unsafe
browser boundaries fail closed to the existing owned fallback.

## 5. Maintainability, documentation and release readiness

The current full source/artifact gate passes formatting, ESLint, 335 strict
files, 435 unit tests, production build, link/budget/content/font/provenance
checks, 617-component SBOM and the high-severity dependency audit. Coverage is
96.53% statements, 93.67% branches, 97.02% functions and 97.47% lines. The
architecture map, README and ADR-0013 record the native/fallback boundary and
the prohibition on cross-operation effect caching.

Private evidence:

- `.tmp/cold-manifesto-terminal-2026-10-25/` and its log: uniform 513-stop
  attribution;
- `.tmp/cold-adaptive-entrances-2026-10-25/` and its log: adaptive pre-reuse
  attribution;
- `.tmp/cold-reused-entrances-2026-10-25/` and its log: preceding copy-reuse
  diagnostic, not final-hash acceptance;
- `.tmp/adaptive-current-scene-matrix-2026-10-25-summary.json`: retained failed
  pre-correction matrix;
- `.tmp/webkit-terminal-wrap-control-2026-10-25-summary.json`: controlled
  WebKit typography correction;
- `.tmp/final-current-scene-matrix-2026-10-25{,-summary}.json`: current-hash
  controlled parity and natural-cleanup matrix;
- `.tmp/native-home-entrances-observed-2026-10-25.log`: 12-case lifecycle run;
- `.tmp/quality-final-entrances-2026-10-25.log`: current complete quality gate.

The final current-hash native-input/lifecycle batch passes 27/27 without retries
or skips: 12 home entrances, 12 Reactor cleanup cases and three product/route
history cases across Chromium, Firefox and WebKit. Full/Lite entrances and
Reactor cases cover 390/1440px. Evidence:
`.tmp/final-home-entrances-functional-2026-10-25.log` (3.5 minutes).
Passing this run does not erase the previously retained intermittent WebKit
fallback failure or establish physical Safari frame pacing.

Current-hash hardware CPU×4, canonical Lighthouse, physical-device,
assistive-technology and legal screenshot approval remain open. Main/Pages
remain held under the user's publication condition.
