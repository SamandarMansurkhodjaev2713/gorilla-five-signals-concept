# Awwwards rebuild milestone review — 2026-08-31

## Scope

This record covers the current `codex/awwwards-rebuild` milestone:

- Flavor Reactor and all five finite flavor presentations;
- Product Truth, Signal Duel, and poster-first Material Film;
- Tashkent Terminal and Service Dock;
- finite global route, menu, and header pointer feedback;
- Full, Lite, Reduced, no-JavaScript, teardown, and history-remount paths.

It is a source milestone, not the final portfolio-release claim. Product Atlas,
Compare, and the five detail worlds remain under the next art-direction phase.

## Executed evidence

- `corepack pnpm run quality`: passed on 2026-08-31.
- Astro Check: 182 files; zero errors, warnings, or hints.
- Vitest: 100 tests in 15 files; 100% statements, lines, and functions; 97.31%
  branches.
- Static build: 47 pages.
- Artifact gates: links, budgets, 38 content records, fonts, ten media
  provenance records, CycloneDX SBOM for 640 components, and the pinned FFmpeg
  binary passed.
- Security audit: no known vulnerabilities.
- Focused Chromium integration contract: 93 of 93 passed in one clean run.
- Fresh authored homepage captures: two of two capture journeys passed.
- Responsive contracts cover 360×800, 390×844, 768×1024, 1024×768,
  1440×900, 1920×1080, and 844×390.

## Corrective iterations

The milestone did not accept its first combined run. The release loop found and
corrected four concrete defects:

1. Unicode route slugs were normalized from their percent-encoded bytes and
   leaked a hex-looking route code. Route segments are now decoded first and
   unsupported scripts fail closed to `SIGNAL`; malformed encoding has a unit
   regression test.
2. The audit script inherited a machine-global pnpm version instead of the
   repository-pinned toolchain. It now runs through Corepack without changing
   the declared version to match the workstation.
3. The Reduced skip-link test mixed keyboard focus with a synthetic mouse
   click. It now activates the focused native link with `Enter` and verifies
   URL, focus, and idle route motion.
4. The route-remount test assumed a deferred nested locator was mounted before
   it entered proximity. It now scrolls the locator into view before asserting
   its independent ready state, preserving rather than weakening the deferred
   mounting contract.

## Five review lenses

### 1. Correctness and edge cases

Evidence: 100 unit tests plus the 93-test Chromium contract cover rapid flavor
intent, invalid URL state, Unicode and malformed route segments, media failure,
stored pause, history restoration, and no-JavaScript fallbacks. The Unicode
route defect above was found and fixed during this pass.

### 2. Architecture, coupling, and cleanup

Evidence: product, compare, media, terminal, service, navigation, and route
motion are separated into focused lifecycle-owned modules. Browser tests prove
capability rebuild, route remount, interrupted timelines, source release, and
zero residual presentation properties. Global magnetic ownership was narrowed
to header/menu targets so component transforms are not stolen.

### 3. UX, responsive behavior, and accessibility

Evidence: all seven required viewports, touch targets, keyboard-only selection,
native FAQ disclosure, skip-link focus, Reduced/Lite/Full, and no-JavaScript
content parity pass. Fresh desktop and mobile captures were inspected after the
automated run. Service Dock mobile spacing was recomposed after review so its
negative space carries the diagonal signal handoff instead of becoming an
undirected gap.

### 4. Performance, security, and dependency risk

Evidence: homepage initial JavaScript is 12,772 bytes gzip and the largest
localized initial transfer in this build is 43,261 bytes gzip, both far below
their hard budgets. Below-fold film networking remains proximity/intent-owned;
Reduced stays poster-only. Audit, SBOM, license, provenance, font, and FFmpeg
verification pass with no new dependency.

### 5. Maintainability, documentation, and release readiness

Evidence: strict types, formatter, ESLint, focused module limits, named motion
specifications, GIVEN/WHEN/THEN tests, deterministic build, and this dated
review record pass. The milestone remains on a protected feature branch until
its exact commit and remote checks are recorded. Final-release status remains
open because route art direction, full cross-browser reruns, Lighthouse, and
external device/assistive-technology evidence are still pending.

## Verdict

The homepage and global-motion milestone is evidence-complete for continued
development. It is approved as the stable base for Product Atlas, Compare, and
product-world work. It is not yet the final portfolio release.
