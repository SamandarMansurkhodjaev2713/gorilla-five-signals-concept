# QA status

## Revalidation — 2026-10-14

The September evidence below is historical. Current source validation passes
formatting, lint, strict types, 111 unit tests, and the 47-page build. Eleven
production Chromium regressions pass for default selection, three-channel
resize persistence, eight arena viewports, and the native no-JavaScript
packshot. Dependency refresh removes all known advisories; the reviewed SBOM
now contains 617 components. The combined quality run passes on Node 24.16.0;
the final release matrix remains open.

The post-refinement product matrix passes all five worlds in three locales
at seven viewports, plus 200% text/WCAG spacing. The shortened 844×390 Atlas
contract passes; measured localized hero height is 322 px without overflow.
WebKit 320 px and 844×390 pass after the test uses verified native scrolling.
Fresh Lighthouse median-of-three failed the current performance gate: homepage
Performance 90/LCP 3.62 s; product detail Performance 91/Best Practices 92.
The detail console violation was traced to Astro inlining the small packshot
script under the existing CSP. Disabling asset inlining makes it an external
script; native packshot reaches ready state with zero console errors. Hero
responsive sizes were corrected, verified selecting the 320 px source at
390 px/DPR 1.75. The corrected Lighthouse series passes all numeric gates:
homepage 96/100/100/100, detail and locator 99/100/100/100. Homepage median LCP
is 2,499.03 ms, narrowly inside the 2.5 s limit; the small margin remains
explicit. All three median CLS values are zero.

Node is now pinned to 24.16.0; Astro ESLint plugin 2.1.1 replaces the vulnerable
fast-glob/micromatch/braces dependency chain. No audit exception is introduced.

### Pre-push correction review — 2026-10-14

The broad browser attempt stopped with 240 passed, ten failed, one interrupted,
and 535 not run; it is not a release pass. Corrections were reviewed through
the five required lenses:

1. Correctness: remove static dialog autofocus, which stole focus even from
   preconfirmed sessions; focus Continue only when opening the required dialog.
   Focus, modal, mobile chrome, and terminal checks pass in ten focused tests.
2. Architecture/lifecycle: keep focus ownership in the existing entry controller;
   no additional listeners, timers, global cleanup, or dependencies introduced.
3. UX/accessibility: mobile terminal line-height raised from 0.78 to 0.88.
   Fifteen visual baselines regenerated; selected phone, landscape, comparison,
   and desktop contact captures inspected. This is not full device sign-off.
4. Performance/security: footer assertions now wait for actual rendered geometry,
   rather than measuring the content-visibility intrinsic placeholder. The 800 px
   limit is unchanged. Product copy no longer asserts unverified sugar or finish
   claims; provenance identifiers remain in source, not consumer comparison rows.
5. Maintenance/release: the Back test clicks the measured visible sticky menu
   instead of triggering Playwright's centering scroll. Three repeats pass with
   the unchanged 12 px restoration tolerance. Updated baselines and tests are
   versioned together; full cross-engine and final Lighthouse reruns remain open.

The pre-push `pnpm quality` run completed successfully: formatting, lint,
219-file strict type check, 111 unit tests, 47-page build, artifact checks,
617-component SBOM/license verification, pinned film toolchain, and dependency
audit with no known vulnerabilities. GitHub private vulnerability reporting is
enabled; repository secret scanning and push protection are also enabled.

- Snapshot date: 2026-09-09
- Technical verdict: **Product Atlas, Signal Duel, and five product worlds pass the current source and focused Chromium gates**
- Deployment verdict: **public GitHub Pages review release is live; rebuild remains on a feature branch**
- Public sign-off verdict: **review build only; commercial-launch claim held**
- Evidence rule: code existence and historical reports are not current pass evidence

## Executed evidence

| Gate                              | Status                   | Current evidence                                                                                                                      |
| --------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Format, lint, strict types        | Passed locally           | Prettier; ESLint zero warnings; Astro Check on 219 files with zero errors, warnings, or hints                                         |
| Unit tests                        | Passed locally           | 111 tests in 18 files                                                                                                                 |
| Unit coverage                     | Passed locally           | 100% statements, lines, and functions; 97.31% branches                                                                                |
| Static build                      | Passed locally           | 47 localized/static pages                                                                                                             |
| Content, links, budgets           | Passed locally           | Links across all 47 HTML files; 38 validated content records; initial JS/transfer limits pass                                         |
| Media/font provenance             | Passed locally           | Ten media records; deterministic font subsets and checksums; pinned FFmpeg binary hash                                                |
| Dependency security               | Passed locally           | Astro and Sharp patched; no high or critical advisories; two moderate transitive advisories remain recorded                          |
| Dependency licenses/SBOM          | Passed locally           | Deterministic CycloneDX 1.6 inventory with 635 reviewed components                                                                    |
| Current rebuild Chromium contract | Passed locally           | Atlas/Compare legacy and focused run: 40 passed; detail matrix, art, fallback, lifecycle, and post-audit boundary runs passed          |
| Current authored capture journeys | Passed locally           | Fresh desktop and mobile chapter captures, two of two                                                                                 |
| Firefox                           | Historical baseline only | Must be rerun after Product Atlas/Compare/detail-world art direction settles                                                          |
| WebKit                            | Historical baseline only | Must be rerun after Product Atlas/Compare/detail-world art direction settles                                                          |
| Accessibility and reflow          | Passed locally           | Axe WCAG 2.2 AA route matrix, keyboard, focus, 200% text, forced colors, 320 px, and reduced motion                                   |
| Motion performance                | Passed locally           | Three independent CPU ×4 product journeys; long task ≤50 ms, application frame work ≤16 ms, LoAF blocking ≤16 ms, interaction ≤200 ms |
| Lighthouse median of three        | Historical baseline only | Last recorded medians were 96–100; rerun is required after the complete Awwwards rebuild                                              |
| Sites worker contract             | Passed locally           | Cloudflare-compatible artifact; redirect, headers, caching, and asset binding verified                                                |
| Public review release             | Passed                   | GitHub Pages baseline release, Quality, Pages, and CodeQL completed successfully before this feature milestone                        |

The current milestone's dated five-lens evidence and corrective actions are in
`docs/quality/AWWWARDS_PHASE5_REVIEW_2026-09-09.md`.

## Performance medians

| Route                    | Performance | Accessibility | Best practices | SEO |      LCP |     CLS |    TBT |
| ------------------------ | ----------: | ------------: | -------------: | --: | -------: | ------: | -----: |
| `/uz/`                   |          96 |           100 |            100 | 100 | 2,499 ms |       0 |  99 ms |
| `/uz/products/original/` |          99 |           100 |            100 | 100 | 2,110 ms |       0 | 8.5 ms |
| `/uz/find/`              |          99 |           100 |            100 | 100 | 1,889 ms |       0 | 3.5 ms |

The runner built a dedicated artifact with entry SHA-256
`42bd41cf7dd502bd03c9569f4e96b2f504d533dd0f22d52ca4323cd53e4a07c0`,
executed exactly three reports per route, validated every JSON boundary, and
wrote the local evidence under `test-results/lighthouse/`. Reports are not
uploaded to a public result service.

## Manual evidence still required before a public launch claim

| Gate                       | Status                              | Required record                                                                       |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------- |
| Assistive technology       | Pending external device session     | Dated NVDA, VoiceOver, and TalkBack task results                                      |
| Physical-device endurance  | Pending external device session     | Thirty-minute mid-tier Android/iPhone thermal, battery, frame, and memory observation |
| Final legal screenshots    | Owner/legal controlled              | Approval for hero, product, locator, mobile, OG, and independently shareable frames   |
| Signed-in production smoke | Pending owner-authenticated session | Live locale, mobile menu, motion pause, metadata, media, and runtime-log check        |
| 72-hour monitoring         | Starts only after public promotion  | Named owner, incident channel, and observation record                                 |

These gates are not silently converted to “N/A.” They do not prevent an
owner-only portfolio review, but they prevent claiming a completed public
production launch.

The private Sites edge serves the generated static document directly and does
not preserve the response-level security headers emitted by the verified worker
adapter. The live document therefore carries CSP and referrer meta fallbacks;
HSTS, frame ancestry, permissions policy, and content-type headers remain a
hosting-edge responsibility. This platform boundary is recorded, not inferred
away. See `docs/release/RELEASE_RECORD_2026-08-10.md`.
