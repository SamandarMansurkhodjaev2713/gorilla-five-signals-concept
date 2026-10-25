# Staged Hero activation review — 2026-10-25

## Outcome and boundaries

Replace monolithic Full Hero preparation with cancellable target-level work,
preserving choreography, unchanged server-rendered preparation poses and exact
style restoration. This is a lifecycle/startup correction, not a new art direction
or evidence that the complete site meets Awwwards or release performance targets.

Architecture: [ADR-0008](../decisions/ADR-0008-owned-staged-scene-activation.md).
No dependency, asset, product claim, environment variable or public API endpoint
was added. Main/Pages publication remains held; the review PR remains draft.

## Five review lenses and resulting changes

1. **Correctness and edge cases.** The first staged prototype incorrectly allowed
   immediate-scene failures to report success. Activation now rejects and selects
   Reduced fallback; an obsolete failed generation cannot overwrite a newer one.
   Tests cover cancellation before/between/during stages, late callbacks, sparse
   stages, exact thrown values and cleanup failures.
2. **Ownership and architecture.** Register partial handles before awaiting ready.
   Abort owns pending frames, observers, listeners and registry cleanup. Exceptions
   leave the GSAP callback before propagating so ambient context ownership remains
   valid. Cleanup invalidates touched targets only, then restores original inline
   declarations with priorities.
3. **UX and accessibility.** A paused `from` timeline initially exposed its start
   poses during preparation. Each stage now restores the SSR pose before paint.
   Browser inspection additionally caught pointer quickSetter normalization of
   the orbit; pointer preparation now uses the same transaction. Native controls,
   Lite/Reduced content and warnings retain their existing behavior.
4. **Performance and security.** Group-level staging still produced native Chrome
   callback durations of 31.547ms and 20.518ms at requested CPU×4. LoAF-only evidence
   missed these callbacks. Split preparation into sixteen singleton-target stages,
   one pointer stage and one final playback stage. Preserve the 16ms budget; do
   not reinterpret missing LoAF entries as a pass. No new dependency attack
   surface; the candidate dependency audit reports no known vulnerabilities.
5. **Maintainability and release.** Separate finite queue, activation ownership,
   environment transaction, authored Hero timeline and pointer depth. Unit tests
   assert the exact original 1.665-second choreography and absolute stagger times.
   Readiness is a lifecycle contract, never a performance measurement. Independent
   motion, mobile, Lighthouse and full release gates remain mandatory.

## Source verification

`quality:pages` passes: formatting, zero-warning lint, 289 strict files, 282 unit
tests, production build, artifact budgets, font/content/provenance checks, SBOM
verification for 617 components and dependency audit. Private diagnostic output:
`.tmp/quality-target-staged-2026-10-25.log`.

The final target-level artifact passes 42 browser scenarios without retries in
Chromium, Firefox and WebKit: exact Full/Lite cleanup, injected setup failure,
native scroll/reload exit ranges, cancellation after the first target and at the
pointer stage, and real-GSAP preparation poses through all seventeen preparation
observations. Log: `.tmp/target-staged-browser-2026-10-25.log`. Synthetic capability
fault injection is explicitly labeled; it is not claimed as physical input QA.
An independent read-only architecture review found no correctness/ownership
blocker in the final singleton-target implementation.

Three fresh installed-Chrome 155 hardware-composited contexts, requested CPU×4,
recorded all eighteen preparation callbacks through native CDP FunctionCall
events. Maximum runtime callbacks: **14.396 / 11.837 / 18.995ms**. Final playback
in the third run was 1.415ms; the over-budget callback was the first target,
not displaced final work. This improves on the grouped diagnostic but **does not
pass** the 16ms per-session gate. No budget was changed. Traces and summaries:
`.tmp/target-staged-startup-native-trace-2026-10-25/`.
Artifact HTML SHA-256:
`c06ce58245dbffa04491211b54e8aa9f6957925b0d573e93e776b5dde99fdd44`.

Native Chrome resting-state screenshots were inspected at 390×844 and 1440×900;
the existing authored composition, product, copy and first-fold actions remain.
This bounded check is not an all-screen, all-device or physical Safari sign-off.
The target-level candidate has not yet rerun the complete Lighthouse/canonical
scroll-selection performance journeys; their prior failures remain open.

## Retained unsuccessful evidence

- Initial grouped preparation: unwanted SSR pose changes and false Full-ready
  failure handling; corrected, not waived.
- Real-browser preparation: three orbit-style failures; corrected by transactional
  pointer setup. The previous group-level lifecycle batch then passed 39 cases.
- WebKit DPR2 reload: immediate native timing samples could precede the updated
  painted timeline. The read helper now awaits two native paint frames. Range,
  fill, before/active/after and real wheel/reload assertions remain unchanged.
- Group-level canonical CPU×4 journey still failed cold-scroll and selection
  budgets. Software compositing is recorded, not used as an exemption. The
  target-level change does not itself establish those phases are fixed.

Private diagnostics remain excluded from Git. Passing source checks does not
authorize or imply public deployment.
