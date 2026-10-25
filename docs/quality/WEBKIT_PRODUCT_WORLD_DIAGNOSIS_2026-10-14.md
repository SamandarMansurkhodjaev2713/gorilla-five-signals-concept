# WebKit product-world rendering investigation

Clarification, 2026-10-25: the installed Windows WebKit default disables
accelerated compositing. These historical local measurements are software-path
evidence, not measurements of accelerated Safari on Apple hardware. Functional
failures are not waived. See `BROWSER_MEASUREMENT_CONTEXT_2026-10-25.md`.

Date: 2026-10-14. Status: unresolved performance gate, not a release pass.

## Acceptance boundary

The actual product entrance must finish naturally within the existing 15-second
readiness gate. Every product must retain its authored world, readable content,
native navigation, Full/Lite/Reduced behavior, and real scroll-linked response.
No forced timeline completion, timeout extension, or skipped engine is permitted.
Passing readiness alone does not establish the frame-work, interaction, or
Lighthouse budgets.

## Reproduced failure

The committed `65a8df6` source builds successfully, but the WebKit Full entrance
does not complete in three repeated focused runs. Reduced passes those runs.
The element is intersecting and the document is visible; no CSP, page, or runtime
errors explain the failure. The entrance timeline is active and unpaused.

In one observed 15.029-second interval, only four GSAP ticks occurred. Timeline
progress advanced by approximately four 33-millisecond lag-compensated steps,
not by wall time. This identifies a starved animation clock; it is not evidence
that increasing the test timeout would fix the product experience.

A separate native WebKit control without the application rendered 235 frames
in 4.005 seconds. Therefore a blanket claim that headless WebKit cannot animate
on this host is unsupported. Recording and foreground A/B probes did not fix
the application failure.

## Causal probes

These are isolated diagnostic overrides, not shipped production changes. Frame
counts below are individual observed samples, not statistical release metrics.

| Probe | Observed result | Decision |
| --- | --- | --- |
| Ready Reduced application | 247 frames in the four-second sample | Healthy control, not proof for Full |
| Ready Lite / Full application | Four / three frames | Both enhanced paths affected |
| Remove only global procedural grain | Five frames | Insufficient |
| Remove only world-art texture | Three frames | Insufficient |
| Remove only packshot filter or child shadows/filters | Three frames | Insufficient |
| Remove both grain surfaces after scene readiness, retain shadows, filters, 3D and all world nodes | 53 frames initially; separate timed A/B gives 59 frames, median gap 15 ms and natural entrance completion | Positive after readiness; early-mount behavior differs |
| Inject a no-op stylesheet at the same after-readiness point | Two frames, median gap 1331 ms; entrance deadline expires | Empty stylesheet mutation alone does not explain the improvement |
| Remove both grain surfaces before scene mount | Four frames; unchanged 15-second entrance deadline expires | Contradicts a texture-only diagnosis; timing/compositing remains a confound |
| Remove grain and raster effects together | 115 frames; entrance finishes naturally | Diagnostic upper comparison; discarding the art is not the chosen fix |
| Flatten 3D, or isolate/contain the art alone | Three frames | Insufficient |
| Replace procedural surfaces with decoded SVG tiles | Six–seven frames for Original | Rejected as a fix |
| Replace those tiles with lossless PNG | Six frames for Original | Rejected as a fix |
| Bake texture alpha, remove soft-light blend | Six frames | Rejected as a fix |
| No-repeat small or 2048-pixel precomposed PNG surfaces | Four / three frames | Rejected as a fix |
| Move original procedural grain behind content | Three frames | Rejected as a fix |
| Move baked PNG grain into native surface backgrounds, preserving hero gradients | Six frames; entrance incomplete | Rejected as a fix |
| Set whole-article content visibility to visible, remove intrinsic placeholder sizing | Three frames; unchanged 15-second entrance deadline expires | Rejected as a fix |
| Bound original procedural grain to two 128-pixel corner surfaces | Original Full repeats give 60/62/61 frames, median gap 15 ms each, maxima 536–555 ms; natural entrance and real scroll response pass | Repeatable partial improvement, not a production-ready fix |
| Same bounded treatment, other paths | Original Lite remains slow (eight frames, median gap 532 ms); Zero/Extra Full and Lite finish; Mango Full exceeds 15 seconds | Candidate rejected for production; Mango Lite and Lychee were not reached |

PNG experiments verified decoded dimensions, alpha, and actual CSS ownership.
The native-background experiment also verified visibly painted grain; its failure
cannot be attributed to accidentally hiding the texture. Probes whose canvas
validation failed were rerun independently and were not counted as successful
performance measurements.

## Current next step

Whole-article `content-visibility:auto` containment was not causal in isolation.
The repeated bounded-area treatment does not solve Lite or Mango Full. Inspect
actual GSAP transform caches and compositor state in those failed paths before
choosing the next rendering change. The early/late texture-removal contradiction
prevents a texture-only conclusion; large startup gaps also prevent calling the
Original Full samples an uninterrupted 60-fps experience.

The mixed four-second samples include idle frames after entrance completion.
GSAP can legitimately sleep once only paused timelines remain; final ticker
counts are not a standalone rendering metric. The next probe must separate
active-entrance frame gaps from post-entry idle gaps and record the actual
completion wall time. A healthy idle median does not prove smooth choreography.

### Clean active-phase counterfactual — 2026-10-14

A separate six-case run began at `00:11:30.344Z` and closed its final browser at
`00:12:23.754Z`, after the competing quality process was confirmed terminal.
Each case used a fresh WebKit browser, the bounded-grain prototype, and the
original 0.20 + 0.38-second completion timing. The served-bundle override required
one exact source match; no ticker, timeline clock, readiness attribute, or callback
was advanced manually. “Baseline” below means both original activation pairs in
that private prototype, not a modified production release.

| World / entry activation | Median active frame gap |
| --- | ---: |
| Original Lite / both targets | 524 ms |
| Original Lite / media only | 476 ms |
| Original Lite / field only | 516 ms |
| Mango Full / both targets | 526 ms |
| Mango Full / media only | 487 ms |
| Mango Full / field only | 533 ms |

All six naturally completed within the unchanged 15-second gate; none proved
smooth active choreography. Animated targets retained `force3D:true` through
settlement, with a valid parsed cache. Consequently, neither a force-3D reset
fix nor media-only entrance is supported as an adequate production solution.
The 500-ms GSAP lag-smoothing threshold explains why similar large frame gaps
can produce markedly different completion wall times.

The next private experiment tests a cached rendering of the original decorative
field, not a replacement of semantic content or the native product packshot.
The static hero gradient must remain separate from the moving field. Any benefit
requires actual active-phase measurements and pixel/fallback evidence before a
new asset pipeline or production architecture is introduced.

### Separate public-baseline instrumentation control

The security-maintenance branch initially gained a global semantic-visibility
MutationObserver. Five WebKit Full tests exceeded 15 seconds; repeated
computed-style reads on decorative mutations were a suspected contributor.
Passive Original controls
without that observer completed naturally on both actual published main and the
maintenance candidate: 984/973 ms in confirmed sessions and 978/895 ms after native
Continue. No runtime errors were recorded. A subsequent audit found that these
passive pages used DPR 1, while the Desktop Safari test profile uses DPR 2.
The matched DPR 2 passive control (session 55350), with no semantic observer,
tracing, or video, exceeded the unchanged 15-second entrance gate on both actual
live main (15010 ms) and the maintenance candidate (15017 ms). Both pages were
visible and focused, with zero runtime errors and matching 1440×2369 hero bounds.
This establishes a pre-existing high-DPI WebKit limitation, not a maintenance
regression or proof that test instrumentation causes it. The observer
was narrowed to relevant semantic inputs, retaining old-value sensitivity and the
original completion gate; the Full failures persist and are not marked resolved.

These controls cover Original in the public baseline, not the rebuilt feature's
five distinct new art surfaces. Before adopting a rendering change, run a passive
current-feature control and exclude measurement-induced style/layout work. Do
not generalize either branch's result to the other artifact.

### Current-feature coverage corrections and verification

A source audit found five additional negative assertions that could pass with
missing targets or non-finite measurements. The draft harness repairs require
per-family cardinality and finite positive bounds for Compare images/labels,
Atlas labels/copy, Lite decorations, and locator cleanup hooks. Intended compact
labels and hidden locator alternatives remain supported.

Two editorial-boundary cases also navigated to a 404 URL and measured obsolete,
empty selector families. They now require a canonical 2xx semantic page and four
actual editorial families, native paint, positive widths, and a visible measured
subject before the unchanged one-pixel clipping tolerance.

Against the preserved current-feature preview on port 4321, the four focused
Chromium specifications passed 39/39 in session 44226, one worker. The two
corrected editorial-boundary cases separately passed 2/2. Scoped formatting and
lint passed; Astro checked 222 files with zero errors, warnings, or hints. This
verifies the repaired Chromium coverage, not the full suite, other engines, or
the outstanding motion/performance gates. No production source or preview build
changed during these checks.
Choose a production change only after natural entrance and actual scroll-response
evidence, then rebuild and rerun cross-engine, responsive, accessibility, and
production performance gates.

Rejected SVG/PNG masters, derivatives, generator, and candidate metadata are
preserved in ignored local research at `.tmp/rejected-material-textures-2026-10-14/`.
They are excluded from production content and public assets. Format conversion
alone is not an optimization success.

## Five review lenses

1. **Correctness:** readiness requires the actual entrance callback; test-only
   clock advancement and forced attributes are prohibited.
2. **Architecture:** probes leave timeline ownership, observers, cleanup, and
   world composition unchanged; diagnostic browser processes are closed after
   each experiment.
3. **UX and accessibility:** Reduced is a control, not a forced replacement for
   users who selected Full or Lite. Readability and product identity remain gates.
4. **Performance and security:** isolated controls refute the host-only theory;
   codec experiments that do not improve rendering are rejected. No new runtime
   dependency or weakened CSP is justified by this investigation.
5. **Maintenance and release:** keep the rebuild in a draft feature branch. The
   live Pages baseline is not proof that this newer artifact passes its gates.
   Publish measured limitations rather than claiming Awwwards readiness.

## Isolated browser-fixture review

The clipboard journey now grants permission to `new URL(baseURL).origin`, not
the owner's fixed preview port. An absent fixture URL throws explicitly; invalid
URL syntax is rejected by the native URL parser. The actual copy action, status,
clipboard read, and canonical product-selection assertions remain unchanged.

Five lenses: the permission matches the served application (correctness); no
production resource owner changes (architecture); the real user journey remains
asserted (UX); permission is limited to one origin (security); and another isolated
preview port no longer produces a false failure (maintenance). Formatting and
diff checks pass; focused browser revalidation is still required. No snapshot,
timeout, clipboard, or accessibility assertion is weakened.
