# Awwwards Phase 5 milestone review — 2026-09-09

## Scope

This review covers the authored Product Atlas, responsive Signal Duel, and the
five localized product-detail worlds on `codex/awwwards-rebuild`. It records a
feature milestone, not final portfolio-release approval.

## Executed evidence

- `corepack pnpm run quality`: passed after the framework security update.
- Astro Check: 219 files; zero errors, warnings, or hints.
- Vitest: 111 tests in 18 files; 100% statements, lines, and functions; 97.31%
  branches.
- Static build: 47 pages; all internal links, transfer budgets, 38 content
  records, fonts, ten media records, and the pinned FFmpeg toolchain passed.
- CycloneDX 1.6 SBOM: 635 reviewed components.
- Dependency audit: no high or critical advisories; two moderate transitive
  advisories remain visible.
- Atlas and Compare focused/legacy Chromium run: 40 passed.
- Product-detail matrix, art, fallback, and lifecycle runs: 11 passed.
- Post-audit boundary run: nine passed across eight Compare viewports and the
  representative no-JavaScript product journey.

## Corrective iterations

1. Product Atlas observers initially competed with explicit hash, pointer, and
   keyboard intent. Navigation now owns a finite intent window, suppresses
   observer churn, and keeps selection, focus, history, status, and live events
   synchronized.
2. Signal Duel initially overlapped content, repeated indefinite field motion,
   and exposed an invented frequency value. The arena was recomposed, the cue
   made finite and teardown-safe, and fabricated data removed.
3. Product-detail worlds initially shared residual presentation transforms
   after Full-to-Reduced changes. A scoped presentation reset now releases only
   world-owned properties on setup, teardown, and reduced readiness.
4. A missing grain asset produced a real build-time 404. The texture was
   replaced with code-native gradients, eliminating the request and preserving
   the material surface.
5. Independent visual acceptance found three P1 defects: the no-JavaScript
   packshot was hidden, compact Compare discarded its third URL selection, and
   the lead promised certainty while source fields were still pending. The
   native picture is now the default fallback, all three selections persist and
   render as a sequential compact channel, and the lead uses an honest
   frequency-discovery promise. All three corrections have focused regression
   coverage.

## Five review lenses

### 1. Correctness and edge cases

Evidence covers invalid and duplicate selections, rapid explicit intent,
history, deep links, image abort/failure, no JavaScript, Full/Lite/Reduced
changes, and repeated lifecycle teardown. The compact third-selection loss and
no-JavaScript packshot defect were found by adversarial review and corrected.

### 2. Architecture and cleanup

Atlas navigation, observation, selection, and view-model concerns are isolated.
Compare field cue, URL state, sharing, rendering, and event ownership are
separate modules. Product worlds use typed exhaustive specifications and scoped
presentation cleanup instead of global style erasure.

### 3. UX, responsive behavior, and accessibility

The focused contracts cover 320 px plus the seven required project viewports,
three locales, touch, keyboard, 200% text, WCAG spacing, Reduced motion, and
no-JavaScript paths. Compact Compare presents the third channel sequentially
instead of deleting user intent.

### 4. Performance, security, and dependency risk

Localized initial JavaScript remains below 16 KB gzip and the largest current
localized initial transfer remains below 44 KB gzip, far under hard budgets.
Astro, Sharp, fast-uri, js-yaml, and svgo were patched; licenses were reviewed
before regenerating the SBOM. No high or critical dependency advisory remains.

### 5. Maintainability and release readiness

Strict types, zero-warning lint, deterministic static output, named constants,
GIVEN/WHEN/THEN tests, source provenance, and fail-closed SBOM policy pass. The
milestone remains a draft pull request because final Firefox/WebKit,
Lighthouse, physical-device, assistive-technology, and legal screenshot gates
are not complete.

## Open visual refinements

### Revalidation on 2026-10-14

- Correctness: discovered and fixed the accidental three-product default;
  two products remain the default, three explicit selections persist.
- Architecture: separated the default count from the responsive capacity.
- UX: eleven production Chromium regressions prove desktop/mobile/landscape
  persistence, eight arena viewports, and native no-JavaScript imagery.
- Security: the fresh audit invalidated the September verdict. Updated patched
  dependencies and removed the vulnerable braces chain through Astro ESLint
  plugin 2.1.1; Node 24.16.0 satisfies its runtime requirement. Audit now reports
  no known vulnerabilities, with no exception or disabled policy.
- Maintenance: runtime pins and README are synchronized; SBOM regenerated
  from reviewed package licenses for 617 components. Full quality verification
  passes on Node 24.16.0, including the unmodified high-severity audit gate.

Cross-engine revalidation isolated a Playwright WebKit scrolling defect:
`scrollIntoViewIfNeeded()` leaves the viewport at zero inside the clipped
arena, while the native `scrollIntoView()` reaches the image and triggers lazy
loading. The contract uses native scrolling, verifies viewport entry, and
requires completion plus nonzero native width. WebKit 320 px and 844×390 both
pass the focused repeat; Firefox passes its focused repeat.
A 404 observed while rebuilding `dist` during the first Firefox run is excluded;
subsequent browser runs use an immutable completed build.

- Extra now uses a left suspended can and lower-right text; Mango uses an
  elevated can and a lower-left amber typography field. The first Mango frame
  exposed dark copy over blue; the amber diagonal was expanded. Rotating the
  stage initially exceeded hero bounds by 19 px; rotation now belongs to the
  can image only. The complete locale × seven-viewport matrix and 200% text
  contract pass after correction.
- Landscape Atlas hero is 322 px at 844×390 in all three locales, with no
  horizontal overflow; chapters use compact proportional media and natural
  content growth. Its 844×390 contract passes.
- Fresh decoded Reduced Material Film capture preserves all five cans and the
  aluminum/water/light material composition. The earlier weak static state is
  not reproduced in the current artifact.

Five refinement lenses: correctness caught the rotated-stage overflow;
architecture keeps material/layout in feature CSS and scoped motion unchanged;
UX caught Mango contrast and proves seven-view reflow; performance adds no
asset or runtime dependency; maintainability records actual screenshots,
regressions, and the isolated Lighthouse CLI server fix. Lighthouse now uses
documented `--ignore-lock` to start its dedicated artifact server while an
owner preview is running, retaining entry-hash validation and owned cleanup.

These are P2 art-direction refinements, not concealed release blockers. They
remain explicit work before the final portfolio claim.

## Verdict

Phase 5 is suitable for a public draft milestone after the exact commit passes
remote Quality and CodeQL. It is not yet approved as the final Pages release.
