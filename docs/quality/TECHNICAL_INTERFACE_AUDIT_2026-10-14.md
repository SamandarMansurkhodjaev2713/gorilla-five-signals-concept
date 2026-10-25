# Technical interface audit — 2026-10-14

## Implementation integrity verdict

The current candidate `beebfd7` expresses a coherent, product-specific system:
five authored worlds, native-scroll Atlas, responsive three-product comparison,
and a finite, poster-first film. This is a technical assessment, not evidence
of an award, subjective perfection, or commercial launch approval.

Impeccable context and its detector were executed once against the existing
implementation. No new visual world or documentation-format migration was
introduced. The detector returned one warning, verified below; it did not
identify a systemic repeated pattern.

## Provisional health assessment

| Dimension | Score / 4 | Evidence and limitation |
| --- | ---: | --- |
| Accessibility | 3 | All 56 Chromium accessibility cases pass in the current broad run; manual assistive-technology evidence remains open. |
| Performance | 2 | Source budgets pass, but Full WebKit entrance stalls with application-specific frame starvation; final cross-engine and performance gates remain open. |
| Responsive design | 3 | Current Atlas, comparison, mobile type, terminal, film, and Reactor contracts pass; full visual/cross-engine run and physical devices remain open. |
| Theming | 3 | Semantic and product tokens drive the established dark/mineral-paper identity, with explicit forced-colors states; a light theme is not a product requirement. |
| Implementation integrity | 3 | Product-specific compositions, typed content, finite lifecycle ownership, and clean source gates; one easing-role inconsistency and the remaining release checks prevent a final verdict. |
| Total | 14 / 20 | Good, provisional, with a major performance issue; not a release score or Awwwards prediction. |

## Verified findings

### P1 — Full product-world entrance does not complete in WebKit

- Location: `src/motion/scene-setups/product-detail-world-motion.ts` and its
  rendered product-world composition; exact rendering bottleneck not yet isolated.
- Category: performance / motion.
- Evidence: Full fails three isolated repetitions within the unchanged 15 s
  limit; entry remains active/unpaused at 0.231 of 0.58 s in four recording/
  foreground variants. A minimal WebKit native-RAF/CSS control is healthy at
  approximately 60 fps, so this cannot be dismissed as a universal environment bug.
- Impact: the authored Full product response fails its finite completion gate.
  Static product information and actions remain available, but the requested
  motion quality is not yet achieved across engines.
- Next step: compare the actual page without JS and in Reduced/Lite/Full;
  isolate compositing or motion work before changing production code. Preserve
  every product world and semantic/interaction contract.
- Follow-up: `/impeccable optimize`, then bounded `/impeccable polish` confirmation.

### P2 — Atlas easing role does not match its motion contract

- Location: `src/styles/tokens.css:121` and
  `src/features/products/product-atlas-stage.css:170`.
- Category: implementation integrity / motion.
- Evidence: the detector flags the overshooting `motion-ease-settle` curve.
  Its only consumer translates, rotates, and scales selected archive packshots.
  `docs/motion/MOTION_SYSTEM.md` reserves settle for tiny non-spatial feedback.
- Impact: the selection accent can feel springy rather than like a precise
  industrial lock. This is not a keyboard, semantic-state, or content failure.
- Recommended correction: use the existing snap easing for the Atlas transform,
  then remove the unused settle token and obsolete role. Preserve native state,
  Full/Lite/Reduced behavior, finite duration, and current visual rest geometry.
- Follow-up: `/impeccable animate`, with scoped verification rather than a redesign.
- Correction implemented in source after the audited candidate: Atlas now uses
  snap, and the unused CSS settle token is removed. The completed broad run
  served the unchanged beebfd7 artifact; corrected-candidate runtime verification
  is intentionally separate. This is not a claim that every GSAP easing changed.

Five-lens review of this correction: semantic selection and rest geometry are
unchanged; no lifecycle resources or new coupling are introduced; Reduced and
forced-colors rules remain authoritative; the transform-only transition retains
its finite duration and adds no dependency; the token and motion documentation
are updated together. Verification must run after the next build, not against
the older served artifact.

### P3 — Manifesto compositor hints persist in the static stylesheet

- Location: `src/features/home-signal/home-manifesto.css`, carrier and line rules.
- Category: performance.
- Evidence: static `will-change: transform` and `will-change: clip-path` declarations
  remain outside runtime ownership. They are narrowly scoped, not global.
- Impact: browsers may retain unnecessary compositor resources in idle/Reduced
  states. No measured budget failure is attributed to these declarations.
- Recommendation: evaluate removing the static hints in a future measured
  optimization; do not claim a gain without a trace or add new permanent hints.
- Follow-up: `/impeccable optimize` only if current motion measurements show need.

## Positive findings and outstanding evidence

Reduced motion is not a global 0.01 ms animation kill: native content, selection,
focus, and task outcomes survive. Current tests prove no-script product and
comparison content, safe media errors, bounded playback, mode rebuild cleanup,
and repeated route ownership. The source check passes strict types on 219 files,
111 unit tests, 47 pages, provenance, 617-component SBOM/licenses, and a clean
dependency audit. GitHub Quality and CodeQL pass for `beebfd7`.

The complete browser result, normal visual regression, final laboratory
performance, live Pages smoke, physical-device/assistive-technology sessions,
legal screenshot approval, and observation window remain separate gates.
Do not infer completion from this report or substitute regenerated snapshots
for acceptance. Any correction must retain the five review lenses from
`AGENTS.md`; `/impeccable polish` is the bounded final visual confirmation,
not an open-ended refinement loop.

## Five-lens evidence-harness correction review

1. Correctness: the broad beebfd7 attempt ends with 372 passed, 407 intentional
   engine skips, and seven failed. HTTP 304 from repeated comparison navigation
   is trace-confirmed, not assumed. Independent mode fixtures preserve the HTTP,
   semantic, product, and no-animation assertions.
2. Architecture/lifecycle: the scene factory is decomposed and failure cleanup
   tests added. Capture and frame-state helpers are test-only; JSHandles are
   explicitly disposed. No production timer, forced callback, ticker tweak,
   second resource owner, or dependency is added for a laboratory failure.
3. UX/responsive: capture cases retain every viewport/product/browser combination
   while splitting batches into independently bounded cases. Browser-specific
   filenames prevent overwriting. Native scrolling and image readiness precede
   section capture; a uniform placeholder cannot count as a rendered frame.
4. Performance/security: four GSAP ticks in 15.029 seconds explain WebKit's
   incomplete entrance under the headless harness. Frame polling alone still
   fails three Full repetitions; no 15-second timeout or motion budget is raised.
   Recording/foreground A/B evidence is required before adopting another fix.
5. Maintenance/release: the inventory now lists 861 cases in 31 files. Source
   types, lint, formatting, and 115 unit tests pass, but the next build and browser
   evidence remain separate. Historical matrices and regenerated goldens are
   not used to close a current gate.
