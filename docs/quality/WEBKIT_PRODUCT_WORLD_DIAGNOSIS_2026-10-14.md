# WebKit product-world rendering investigation

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
| Remove both grain surfaces after scene readiness, retain shadows, filters, 3D and all world nodes | 53 frames; entrance finishes naturally | Conditional positive; not independently reproduced at early mount |
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
| Bound original procedural grain to two 128-pixel corner surfaces | 63 frames; median frame gap 15 ms, maximum 531 ms; entrance naturally completes | One positive sample with visibly painted grain; repeat/all-world evidence pending |

PNG experiments verified decoded dimensions, alpha, and actual CSS ownership.
The native-background experiment also verified visibly painted grain; its failure
cannot be attributed to accidentally hiding the texture. Probes whose canvas
validation failed were rerun independently and were not counted as successful
performance measurements.

## Current next step

Whole-article `content-visibility:auto` containment was not causal in isolation.
Repeat the bounded-area material treatment across worlds and compare identical
after-readiness mutation timing against texture removal and a no-op mutation.
The early/late texture-removal contradiction prevents a texture-only conclusion.
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
