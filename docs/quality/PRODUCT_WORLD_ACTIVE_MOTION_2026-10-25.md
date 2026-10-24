# Product-world active motion — 2026-10-25

## Current-artifact diagnosis

The ownership correction in `fa830ff` prevents entrance and scroll-scrub from
writing the same transform concurrently. It does not prove compositor speed.

Homepage HTML SHA-256:
`d84034eaea8439921beeb7be84db26d1aeaa5c39ae8d31879778a1a469080c30`.
The private report additionally binds the actual Original product HTML and
records loaded fonts, decoded native product media, viewport, engine and DPR.

Four natural active-phase observations, all at DPR2:

| Engine/context | Active frames | Active interval | Observed entrance |
| --- | ---: | --- | --- |
| Chromium, 1440×900 Full | 18 | median 33.3ms; max 50.1ms | completed in 600ms |
| Chromium, 390×844 coarse Auto/Lite | 34 | median 16.7ms; max 16.8ms | completed in 600ms |
| WebKit, 1440×900 Full | 6 | median 1363ms; max 1397ms | incomplete at observation cutoff |
| WebKit, 390×844 coarse Auto/Lite | 3 | two intervals, 269/289ms | completed in 1100ms |

Only samples between the first actual numeric transform change and the native
application entrance-complete marker are counted. Idle frames do not establish
active animation performance. No GSAP clock forcing, lower DPR, error filtering
or lag-smoothing change was used. Runtime errors were empty in these contexts.

The WebKit Full cutoff is 15 seconds from navigation. Readiness was first sampled
at 5617ms and the first actual change at 7001ms. Therefore this observation is
**not** a full 15-second-after-entrance timeout test. Its six very sparse active
frames still demonstrate a real pacing problem. The mobile WebKit sample has
only two gaps and cannot support a stable statistical performance claim.

## Decision

Do not publish an all-animation smoothness or performance-budget acceptance claim.
Do not repeat the same benchmark without a causal implementation hypothesis.
Investigate the decorative field's compositor topology while keeping the can,
copy, viewport density, approved product assets and authored motion intact.

The next private experiment is a single cached decorative field. It must pass
pixel-fidelity and transparent-alpha checks against the actual source before
motion measurements or production assets are considered. A static pixel pass
alone will not demonstrate motion speed. A projection installed after an
entrance has begun cannot establish that it made that entrance fast.

## Five review lenses

1. Correctness: distinguish readiness, active movement, completion and idle.
2. Architecture: fix competing owners separately from raster/compositor cost.
3. UX/accessibility: retain distinct Full/Lite/Reduced behavior and visible copy.
4. Performance: preserve DPR2 and active-phase evidence; record sparse samples.
5. Release: retain the publication hold and explicit failed/unverified budgets.

## Private decorative-field fidelity experiment

The bounded DPR2 export now passes static fidelity. The source field is
1440×832 CSS pixels; its complete transparent PNG is 2880×1664 physical pixels.
An initial viewport screenshot was correctly rejected because it clipped the
last 68 CSS pixels. The accepted method captures the full document and extracts
the complete measured field rectangle, without omitting any artwork.

The PNG is 2,583,018 bytes, SHA-256
`fbad0d7a70ddb44ef182bb717144a1ea87e75092b03cc0cae1efa6765a54f91e`.
It has 2,237,860 fully transparent and 2,554,460 painted pixels. Projection mean
channel difference is 0.003766 against the existing 0.5 limit; the fraction of
channels differing by more than two is 0.000123687 against the 0.02 limit.
Restoring the original field gives an exact pixel match and identical markup.

An isolated Chromium fixture reproduced a restoration-harness discrepancy:
clearing CSSOM then removing `style` without synchronizing the attribute could
recreate an empty attribute. Reading the pending attribute before removal
restored the original absent attribute exactly. All five original ancestors
then pass the strict null-to-null comparison; the contract was not weakened to
treat empty and absent attributes as equivalent.

This remains a private experiment. Its large PNG is **not** approved for the
900KiB transfer budget, is not a production asset, and proves neither animation
speed nor LCP. Before-entry control/candidate measurements must use identical
readiness conditions and preserve the global grain, live can, copy and DPR2.

## Fair before-entry motion A/B: rejected as an adequate fix

Both WebKit Full DPR2 cases delayed the same real GSAP module request until the
actual fonts, native packshot and identical private PNG were decoded. The source
control decoded that PNG without displaying it; the candidate replaced only the
decorative field before releasing the module. Neither case changed application
readiness attributes, advanced a timeline clock, removed global grain, replaced
the live can/copy or reduced DPR.

The source control remained slow: 11 active frames, median 1366ms and maximum
1662ms; it did not complete within 15 seconds after real motion readiness. The
candidate also failed: 15 active frames, median 953ms and maximum 1233ms, with
no entrance completion before the outer 15.5-second-after-readiness deadline.
Its final recorded active sample was 14.867 seconds after readiness; a sparse
next RAF had not reached the internal deadline, so the outer cutoff is recorded
explicitly rather than mislabelled as a completed internal timer.

All fonts/media were ready and runtime errors empty. The control remaining slow
rules out a false success caused solely by the shared prewarm condition. The
candidate's modest improvement is nowhere near acceptable active frame pacing.
Reject full-field flattening as a sufficient solution. Do not ship the 2.58MB
PNG, build a five-world raster pipeline, or relax the frame/transfer budgets on
the basis of this experiment. Global overlay/compositing interactions remain a
separate causal question, not a demonstrated fix.
