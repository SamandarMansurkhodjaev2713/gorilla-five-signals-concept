# Footer native entrance review — 2026-10-25

Status: bounded source, parity and hardware callback gates pass; wider
performance and release gates remain open.

## Outcome and evidence boundary

Move only the shared SiteFooter's six-signal entrance to the finite native player.
The global scene registry applies this adapter wherever that Footer is rendered;
the controlled browser matrices and hardware traces in this review exercise its
homepage instance. Keep responsible-entry, the generic GSAP signal helper,
component markup, CSS, copy, Reduced motion and no-JavaScript behavior unchanged.

The immutable entry-document SHA-256 is
`91962ea9f6c37b9fc748b1381c98277edef073f7b923f09108897ecb18b3d2bb`.
The terminal post-split quality log is
`.tmp/quality-footer-final-2026-10-25.log`.
Private controlled evidence is retained with the frozen artifact; hardware
evidence is under `.tmp/cold-footer-native-2026-10-25/`. Browser matrices prove
controlled parity and cleanup, not physical-device frame pacing.

## Five-lens self-review

### 1. Correctness and edge cases

The native plan contains the rails parent plus five children in DOM order. Exact
delays are 0/40/80/120/160/200ms, every effect lasts 260ms, and the terminal
effect ends at 460ms. The sampled snap easing, transform origin and scale poses
match the original GSAP sequence.

The native boundary accepts only six signals with no copy target. Unsupported
WAAPI, five or seven signals, an unexpected copy target, or an inline value or
priority across all eight presentation properties selects the original GSAP
fallback before native animation allocation. The fallback uses the public GSAP
completion callback; an empty sequence completes synchronously. Repeated start,
completion, destroy and stale post-destroy start converge on one owned cleanup.

Focused plan, boundary and owner tests pass, including scoped IDs, exact timing,
unsupported/malformed states, custom inline presentation, natural completion
and exact fallback cleanup.

### 2. Architecture, coupling and cleanup

Footer is the sixth thin adapter over the neutral player and owner:

```text
Reactor ───────┐
Material Film ─┤
Manifesto ─────┤
Terminal ──────┼─> FiniteAnimationPlayer + FiniteEntranceOwner
Service Dock ──┤
Footer ────────┘
```

Each consumer owns its typed targets, schedule, prefix and fallback binding.
The neutral core owns public-WAAPI construction, a shared document-clock start,
completion, failure, cancellation and exact cleanup. No feature selector enters
the core and no effect cache outlives one construction batch.

`SCENE_SETUPS.footer` alone changes composition. Responsible-entry continues to
use its pre-existing local `setupSignalScene`; `createSignalSequence` is not
modified. The Footer fallback runs inside a scoped GSAP context, stops with
`kill(false)`, then restores exact values and priorities for eight declarations.

### 3. UX, responsive behavior and accessibility

No semantic element, text, focus order, link, pointer behavior, breakpoint or
layout declaration changes. Full and Lite use the same approved Footer entrance;
Reduced and no-JavaScript remain immediately visible. The native and fallback
paths both relinquish presentation ownership at natural completion.

The controlled matrix covers Chrome, Firefox and WebKit, Full/Lite and
390/1440px: 12 pairs and 24 captures with zero out-of-budget numeric
differences. Maximum rect delta is 0.067749px, matrix-linear delta is
0.0000646678, and translation, opacity and clip deltas are zero. Natural
cleanup and exact eight-property inline restoration pass 24/24 on both
backends; font metadata matches and no application or cleanup error is
recorded.

### 4. Performance, reliability and security

Before conversion, CPU×4 callbacks were 24.670/23.119/23.211ms. Each contained
11 style-tree updates and five layouts, totaling 8.570/9.589/9.764ms. The frozen
native artifact measures 7.283/4.623/9.104ms with zero nested
`UpdateLayoutTree`, `Layout` or forced-style/layout work. All three callbacks
pass the unchanged 16ms boundary.

This does not make the complete page pass. Run one records a later y=8000
59.2ms long frame with zero attributed script; the other two runs record no
y=8000 long-animation frame. Product-area callbacks remain
20.844/20.319/19.239ms. Manifesto and Culture each breach once. FAQ callback
setup remains below 16ms, but y=6720 frames are 170.3/206.3/172.8ms with
blocking work of 108.5/142.3/106.8ms. The page-wide performance result is
therefore still failed.

The adapter adds no dependency, endpoint, network request, storage, cookie,
secret, user data, CSP relaxation or external origin. Allocation is bounded to
six effects and is deterministically canceled.

The canonical Lighthouse batch passes all nine audits with exit 0 and an empty
failure list. Its isolated audit entry SHA-256 is
`b4493037596752fe1c2578574e4a93032c98487e7591dbf758ef968217ac97be`;
the local production entry remains the distinct unchanged
`91962ea9f6c37b9fc748b1381c98277edef073f7b923f09108897ecb18b3d2bb`.
Home Performance is 98/98/98. LCP is 2337.84/2414.34/2334.32ms, with a
2337.84ms median; TBT is 78/37.5/34.5ms, with a 37.5ms median; CLS is 0.
Product and Find Performance medians are 99, with LCP medians of 2186.76ms and
1959.09ms and 0ms median TBT. Accessibility, best practices and SEO are 100 in
all nine audits. All five secondary-image hints remain Low with zero promotions
in each home run, and the age text remains LCP.
Evidence is retained in `.tmp/lighthouse-footer-2026-10-25.log`,
`test-results/lighthouse/summary.json` and
`.tmp/lighthouse-footer-image-priority-2026-10-25.json`.

The separate FAQ intrinsic-size control does not justify a CSS change. It
partially reduces some layout samples but retains the full-document pass and
produces inconsistent containing frames. The production stylesheet is
unchanged; the rejected hypothesis and next evidence boundary are recorded in
[FAQ render-tail diagnostic](FAQ_RENDER_DIAGNOSTIC_2026-10-25.md).

### 5. Maintainability, documentation and release readiness

Timing is derived from named standard and instant duration tokens. The exact
target count is named, the prefix is feature-scoped, and boundary tests reject
markup drift rather than silently changing choreography. Source modules remain
focused and reuse the shared lifecycle instead of copying it.

The final post-split source/artifact gate passes formatting, lint, 356 strict
files, 462 units, coverage of 96.79/93.95/97.42/97.67%, the 47-page build,
artifact verification, the 617-component SBOM and audit level high with zero
findings.

The first combined functional batch passed 35/36. Its Chromium Full 1440px case
hit the unchanged 45-second watchdog after all five entrances and the pause had
finished, while the next Reduced Material style assertion was running. The log,
trace, video, screenshot and context are preserved under
`.tmp/footer-functional-before-split-2026-10-25/`; no application or assertion
failure was observed before timeout.

A tests-only scenario split kept every timeout and assertion unchanged. The
corrected batch passes 48/48 in 2.8 minutes with exit 0, no retries and no skips:
12 Footer cases, 12 original four-scene cases and 24 entry-paint cases. Evidence:
`.tmp/footer-functional-split-2026-10-25.log`. The production artifact remains
the same immutable SHA. This resolves harness scheduling, not application code,
and does not erase the initial watchdog evidence. Physical-device,
assistive-technology, legal and publication approval remain independent.

## Acceptance ledger

| Gate                         | Evidence                                           | Status |
| ---------------------------- | -------------------------------------------------- | ------ |
| Source and artifact quality  | Final quality/build/artifact/SBOM/audit            | Pass   |
| Footer plan and ownership    | Strict types plus focused plan/boundary/owner unit | Pass   |
| Controlled parity            | 12 pairs, 24 captures, no out-of-budget delta      | Pass   |
| Lifecycle and exact cleanup  | Natural cleanup and eight-property restore 24/24   | Pass   |
| Footer callback performance  | Three CPU×4 callbacks below 16ms, zero nested work | Pass   |
| Footer post-activation frame | No long frame in every run                         | Open   |
| Complete-journey performance | Existing unchanged global gates                    | Fail   |
| Final functional             | Split 48-case batch on the immutable artifact      | Pass   |
| Canonical Lighthouse         | Nine audits, exit 0, empty failure list            | Pass   |
| Physical and release review  | Device, AT, legal and publication approval         | Open   |

See [ADR-0015](../decisions/ADR-0015-footer-native-ownership.md). Results may be
promoted only after the corresponding terminal evidence exists.
