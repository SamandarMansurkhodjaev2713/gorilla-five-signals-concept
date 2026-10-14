# QA status

## Revalidation — 2026-10-14

### Shared font-loading and small-screen investigation

A paired cold-font experiment on the separate maintenance artifact ran 24
cases across UZ/RU/EN and four viewport shapes. Replacing `32/38ch` with the exact
browser-loaded Onest-derived `em` measure preserved the final paragraph width,
but did not reliably preserve layout: UZ desktop removed a 29.39 px copydeck
shift while EN desktop introduced one of the same size. Phone paragraph height
was unchanged; heading, plate, navigation, and controls still contributed shifts.
The proposed width-only fix is rejected. Artificially gated font delivery is
causal research, not Lighthouse or field-performance evidence.

At 320 px the existing responsive CSS hides the description in every tested
variant. This is a known content-parity defect, tracked in
[issue #17](https://github.com/SamandarMansurkhodjaev2713/gorilla-five-signals-concept/issues/17),
not a successful readability result. Restore an intentional small-screen
composition and verify the product, description, and controls together before
closing it. Targeted font/hero styling is shared with the feature branch; the
maintenance image `sizes` correction is an explicit artifact difference.

### Painted-target coverage correction — `8d0117d`

The previous broad Chromium pass did not prove two editorial-boundary cases:
they requested a 404 URL and queried obsolete selector families. The corrected
tests require a canonical 2xx page, each actual family, native scrolling/paint,
and finite positive geometry before checking the original clipping tolerance.
Other responsive contracts now reject absent Compare images/labels, Atlas text,
Lite decorations, and locator targets while preserving intentionally hidden
compact content.

Focused verification against the unchanged feature preview: 39/39 Chromium
cases across Compare, Atlas, homepage, and locator; separately 2/2 real editorial
boundary cases. Scoped formatting/lint passed and strict types checked 222 files
without errors, warnings, or hints. This is not a fresh full quality run or a
cross-engine pass; production build and 115-unit evidence below remain tied to
their stated earlier source candidate.

Five review lenses: positive-target contracts prevent vacuous correctness
passes; shared painted-target helpers avoid duplicated measurement logic;
native paint and intentional hidden states preserve responsive UX; no runtime
dependency, source media, performance budget, or production artifact changed;
dated scope and historical evidence remain explicit for release maintenance.

The September evidence below is historical. Current source validation passes
formatting, lint, strict types on 220 files, 115 unit tests, and the 47-page build
for committed candidate `65a8df6`. Eleven
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

### Broad beebfd7 run and next corrections

The completed 786-case attempt records 372 passed, 407 intentional engine skips,
and seven failed. All 262 Chromium cases, including normal visual regression,
pass. Firefox/WebKit failures remain visible, not converted into a pass.
Two comparison failures are traced to the repeated URL returning HTTP 304;
Reduced/Lite cases are now independent fixtures, retaining the 2xx and content
assertions and removing accumulated init-script ordering. Capture batches are
split into per-viewport/product cases without increasing the timeout, and
browser-specific filenames prevent evidence overwriting. Homepage section
capture now scrolls natively, awaits paint/image readiness, and rejects uniform
placeholder images. Screenshot generation still does not equal visual approval.

WebKit Full entrance is traced to headless rendering starvation: the visible
hero's intersection ratio is 0.78846, with no runtime diagnostic. In 15.029 s,
the ticker advances four ticks (0.093 to 0.225 s); the active, unpaused entrance
advances only 0.132 of its 0.58 s. GSAP's default lag smoothing clamps each long
gap to 33 ms, matching four ticks exactly. The scroll timeline is not cancelling
the entrance. The corrected observer starts browser-frame polling immediately
after navigation and requires both Full readiness and completed entrance in one
predicate, with the unchanged 15-second limit. All three Full repetitions still
time out, while the three Reduced repetitions pass. Frame polling alone is
therefore insufficient; subsequent recording/foreground A/B checks also fail.
No production ticker workaround or forced state exists.

A minimal no-app/no-GSAP control contradicts a blanket environment diagnosis:
WebKit delivers 235 native RAF frames in 4.005 s (mean gap 17.09 ms, maximum
31 ms), and its 580 ms CSS animation finishes normally. Chromium also sustains
normal frame cadence after startup. The starvation is application/rendering or
motion-integration specific; Full must not be accepted on the basis of a harness
explanation. Ready Reduced runs normally, whereas ready Lite/Full are starved.
Removing only the two grain surfaces after readiness restores natural entrance
completion in one sample while preserving shadows, filters, 3D, and every
product-world node; applying the same removal before mount fails. Therefore
timing/compositing confounds prevent a texture-only diagnosis. SVG, PNG, baked
alpha, native-background, negative-z, and whole-article containment probes have
not established a production fix. See the [isolated rendering investigation](WEBKIT_PRODUCT_WORLD_DIAGNOSIS_2026-10-14.md);
its samples are diagnostics, not final frame-budget evidence.
The new artifact builds all 47 pages and passes links,
content, fonts/media provenance, budgets, 617-component SBOM/licenses, pinned
film toolchain, and clean dependency audit. Its local Uzbek entry SHA-256 is
`53b82443beffa8d6ed2e3c456fc9557a9125dda02ef0ea92e3b388e578b4daa8`;
this is not the public-mode Lighthouse artifact hash.

Architecture review removes the proven unreachable legacy product component
subtree (2,445 source lines, recoverable from Git). Active routes, feature art,
styles, and hooks remain intact. Scene resource ownership is decomposed without
changing its API or cleanup ordering. Thirteen scoped ownership/registry/contract
tests and the strict type check pass; four new failure/idempotency cases are
included. The next rebuilt artifact must revalidate these source changes.

The changed source passes 115 unit tests, a strict check of 220 files with zero
errors/warnings/hints, formatting, and lint. The refined browser inventory now
contains 861 cases in 31 files because previously aggregated capture and mode
cases are independently named fixtures, not because acceptance scope was reduced.

- Snapshot date: 2026-10-14
- Technical verdict: **Product Atlas, Signal Duel, and five product worlds pass the current source and focused Chromium gates**
- Deployment verdict: **public GitHub Pages review release is live; rebuild remains on a feature branch**
- Public sign-off verdict: **review build only; commercial-launch claim held**
- Evidence rule: code existence and historical reports are not current pass evidence

## Historical executed evidence (preceding candidate)

| Gate                              | Status                   | Current evidence                                                                                                                      |
| --------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Format, lint, strict types        | Passed locally           | Prettier; ESLint zero warnings; Astro Check on 219 files with zero errors, warnings, or hints                                         |
| Unit tests                        | Passed locally           | 111 tests in 18 files                                                                                                                 |
| Unit coverage                     | Passed locally           | 100% statements, lines, and functions; 97.31% branches                                                                                |
| Static build                      | Passed locally           | 47 localized/static pages                                                                                                             |
| Content, links, budgets           | Passed locally           | Links across all 47 HTML files; 38 validated content records; initial JS/transfer limits pass                                         |
| Media/font provenance             | Passed locally           | Ten media records; deterministic font subsets and checksums; pinned FFmpeg binary hash                                                |
| Dependency security               | Passed locally           | Current beebfd7 dependency audit reports no known vulnerabilities                                                                    |
| Dependency licenses/SBOM          | Passed locally           | Deterministic CycloneDX 1.6 inventory with 617 reviewed components                                                                    |
| Current rebuild Chromium contract | Passed locally           | Atlas/Compare legacy and focused run: 40 passed; detail matrix, art, fallback, lifecycle, and post-audit boundary runs passed          |
| Current authored capture journeys | Passed locally           | Fresh desktop and mobile chapter captures, two of two                                                                                 |
| Firefox                           | Historical baseline only | Must be rerun after Product Atlas/Compare/detail-world art direction settles                                                          |
| WebKit                            | Historical baseline only | Must be rerun after Product Atlas/Compare/detail-world art direction settles                                                          |
| Accessibility and reflow          | Passed locally           | Axe WCAG 2.2 AA route matrix, keyboard, focus, 200% text, forced colors, 320 px, and reduced motion                                   |
| Motion performance                | Historical baseline only | Final candidate requires three independent CPU ×4 journeys with unchanged frame, long-task, and interaction gates                   |
| Lighthouse median of three        | Prior candidate only     | Recorded October medians 96–99 pass; rerun against the final candidate and record its artifact hash                                   |
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
