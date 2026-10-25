# ADR-0014: Native Service Dock and explicit discovery priority

Status: bounded source/runtime gates pass; wider performance and release gates
remain open.
Date: 2026-10-25.

## Context

Hardware CPU×4 traces attribute the FAQ Service entrance callback at
35.900/29.193/6.651ms across three runs. Its nested work contains 10/11/10
`UpdateLayoutTree` events and no `Layout` events. The existing Full/Lite GSAP
entrance resolves the same finite opacity and clip-path presentation for each
target. This is a bounded fifth use case for the shared finite native player;
it does not justify a new animation framework or a reduced choreography.

The Footer remains a separate open bottleneck. Its boundary callback measures
45.679/11.557/18.882ms and retains 11 style updates and five layouts. The Service
Dock change neither attributes that work to FAQ nor claims to resolve it.

The preserved pre-change Lighthouse artifact records home simulated LCP at
3482.981/2409.745/3472.275ms. The observed LCP is the visible responsible-entry
age text at 408/349/341ms, so the local observed paint is not the failed
simulation. All five secondary lazy product images start with Low network
priority and an `auto` fetch-priority hint. Runs one and three promote all five
to High before LCP and fail; run two promotes none and passes. Those images total
178,028 bytes. The installed Lantern model includes every non-Low image in its
optimistic dependency graph and all images in its pessimistic graph, making the
promotion pattern a falsifiable candidate rather than proof of causality.

Fonts are not the first intervention: the Latin Onest and Oswald faces are
already preloaded at High priority, finish in 40–52ms, and report zero estimated
font-display savings. The eager/high primary Hero product image finishes in
57–85ms, while the measured LCP element is text. The parser-blocking product
history bridge is deliberately unchanged: its ordering before Astro's router is
a correctness boundary, and the render-blocking audit estimates zero FCP/LCP
savings for it in all three baseline runs.

## Decision

Service Dock becomes the fifth concrete adapter over the shared finite native
player. It supplies feature-owned targets and cue schedules while the neutral
player and `finite-entrance-owner.ts` retain lifecycle, cancellation, exact
snapshot restoration and fallback ownership. The shared owner's contract is:
“Own a one-shot native entrance and its exact-snapshot GSAP fallback.” No Service
selector, content data or scene timing enters the neutral core.

The Full plan contains 12 effects with delays
0/120/175/230/260/300/360/440/495/550/605/660ms and completes at 1000ms. The
Lite plan omits the Full-only contact word/copy effects, contains six effects and
completes at 940ms. Both derive timing from the existing Service motion spec,
preserve the installed easing and use opacity 1 with `clip-path: inset(0)` as
their effect terminal pose. Natural cleanup restores the exact inline snapshot;
the stylesheet's `clip-path: none` is visually equivalent at rest. Reduced
motion and no-JS keep that visible CSS baseline.

The native boundary is fail-closed. Unsupported public Web Animations primitives
or custom inline opacity/clip-path presentation select the existing scoped GSAP
choreography. Independent transforms are compatible because Service animates
only opacity and clip-path. A missing required hook throws before native effect
allocation; the owner diagnoses it and attempts the independently validated GSAP
fallback. Unexpected failures are diagnosed rather than swallowed. The owner
stops native or scoped fallback work before restoring the exact captured inline
values and priorities. Native setup performs no computed-style or geometry read.

Separately, the four decorative Hero ghost products and the below-fold Manifesto
carrier declare `fetchpriority="low"` while retaining `loading="lazy"`, responsive
`srcset`/`sizes`, intrinsic dimensions and async decoding. The primary Hero
product remains eager, synchronous-decoded and `fetchpriority="high"`. This is a
narrow discovery hint for exactly the five resources implicated by the baseline
trace, not a site-wide image policy.

Both changes are built and evaluated in one immutable artifact, but keep separate
acceptance evidence. The native Service path must pass source, controlled parity,
cleanup, cross-engine lifecycle and hardware callback gates. The priority hint
must be evaluated by a canonical nine-run Lighthouse batch plus raw network
priority events. A score change without the expected event change is not accepted
as evidence for the hypothesized cause.

## Rejected alternatives

- Reduce Service targets, timing or effects: changes the approved Full/Lite
  choreography instead of removing repeated setup work.
- Hide the section longer, move initialization outside the measured window or
  weaken the 16ms gate: disguises cost and breaks readiness ownership.
- Replace Reduced/no-JS behavior: those modes already use the correct visible
  baseline and do not need an entrance runtime.
- Preload the five decorative images: a prior image-preload trial did not repair
  the canonical result and would increase early competition.
- Change primary Hero priority or responsive candidates: the primary is already
  eager/high and is not the measured LCP element.
- Rework font loading: current traces show early High-priority completion and no
  audit savings.
- Inline, defer, relocate or preload the history bridge: this risks the required
  parser-before-router event order without baseline evidence of LCP benefit.
- Apply `fetchpriority="low"` to every lazy image: broadens the intervention beyond
  the five resources observed in all three home traces.
- Treat one improved Lighthouse run as success: the baseline itself contains
  substantial variance, so the network event pattern and the complete repeated
  batch are required.

## Consequences and acceptance

The implementation is intentionally a candidate. The combined source and
artifact gate passes formatting, lint, 344 strict files, 449 units, coverage,
the 47-page production build, budgets, content, provenance, the 617-component
SBOM, licenses and the high-severity dependency audit. Its entry-document
SHA-256 is
`184868e03ac73b881af12367bcfb5122403f6f78d1a150f1618afdd1cea36668`.

The canonical nine-run Lighthouse batch passes on audit entry SHA-256
`377c5c4ef5e93d4a304bceed2de84b11a07898814da5d6f03c04d90ed196f6a5`.
Home records Performance 97/98/98, LCP
2340.865/2258.804/2337.968ms, median TBT 69ms and CLS 0. Product records a
98 Performance median, 2190.923ms LCP and 0ms median TBT; Find records a 99
Performance median, 1961.197ms LCP and 0ms median TBT. Accessibility, best
practices and SEO are 100 in all nine audits.

All five targeted images now declare a Low hint, begin Low and record zero
priority promotions before LCP in every home run, changing the baseline
promotion pattern from 5/0/5 to 0/0/0. Home median LCP changes from 3472.275ms
to 2337.968ms and passes the unchanged threshold in all three candidate runs.
This verifies the bounded Lighthouse/discovery candidate; it is not INP, frame
rate, physical-device or complete-journey proof. Service hardware and functional
evidence are reported below.

The controlled Service matrix passes 12 matched native/GSAP pairs and 24
captures across Chrome, Firefox and WebKit, Full/Lite and 390/1440px. Natural
cleanup passes 24/24; exact eight-property inline restoration passes on both
backends in 24/24 captures; font metadata is equal; and application/cleanup
errors are zero. Maximum rect and matrix deltas are zero, opacity delta is
0.000064 and clip delta is 0.029357px, all within unchanged budgets. The capture
process exited 1 only after saving the successful raw matrix because its obsolete
terminal-only reporter could not describe Service. The standalone JSON
comparator then passed the saved artifact with exit 0; this is a harness
reporting defect, not an application or cleanup failure, and it must remain
visible in the evidence record.

Three current-artifact hardware CPU×4 traces measure the Service callback at
10.005/9.007/11.388ms. All three pass 16ms with zero nested
`UpdateLayoutTree`, `Layout` or forced-style/layout events. The prior callback
was 35.900/29.193/6.651ms, so its median changes from 29.193ms to 10.005ms.
This accepts the bounded Service setup gate, not the rendered frame. Containing
frames remain 155.2/106.9/112.8ms with blocking work of
93.8/46.5/56.0ms; render tails are 131.1/85.9/92.0ms and style/layout tails are
123.5/83.0/89.4ms. Median containing-frame duration improves by 24.5ms and the
maximum by 49.1ms, but run three regresses from 104.8ms to 112.8ms and every
frame remains far over budget.

The independent Footer remains over budget at 24.670/23.119/23.211ms with 11
style updates and five layouts. A Product-labelled boundary callback records
29.658/26.178/19.955ms, but its label alone does not prove exact feature
ownership. Manifesto breaches once at 16.846/14.113/14.355ms; Material and
Culture pass at 2.775/4.081/7.154ms and 8.839/13.570/9.853ms. These residuals
keep complete-journey performance open.

The unchanged build artifact also passes all 36 combined functional cases with
exit 0 and no retries or skips: 12 extended native-home cases covering all four
native scenes, plus 24 entry-paint cases across Chrome, Firefox and WebKit,
Full/Lite, 390/1440px, pause, Reduced, exact inline style cleanup, entry reload,
route/back navigation, no-JS and locale behavior.

Acceptance requires all of the following on the same immutable artifact:

- complete formatting, lint, type, unit, build, budget, content, provenance,
  license, SBOM and dependency-audit gates;
- controlled native-versus-GSAP Service comparisons in Chrome, Firefox and
  WebKit for Full/Lite and phone/desktop, including natural completion and exact
  inline cleanup (passed by the saved controlled matrix and comparator);
- native-home and entry-paint functional suites without retries or skips
  (passed: 36/36 on the unchanged artifact);
- three hardware CPU×4 cold traces showing the Service callback below 16ms with
  no nested style-tree update or layout work (passed for the bounded callback);
- nine canonical Lighthouse audits, including all three home raw traces, with
  explicit counts of Low-to-High promotion events for the five targeted images
  (passed on the candidate audit artifact);
- no regression to the primary Hero request, fonts, legal entry, history bridge,
  responsive geometry, Reduced motion or no-JS visibility.

The independent Footer callback, complete-journey performance, physical-device
and publication gates remain open even if this bounded candidate passes.
