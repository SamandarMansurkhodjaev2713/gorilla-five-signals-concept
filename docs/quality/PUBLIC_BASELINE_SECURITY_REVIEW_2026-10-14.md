# Public baseline security and accessibility maintenance — 2026-10-14

## Outcome and scope

Prepare a security-only update to public baseline commit
`784a2b14a15bd486abd39dc68f8ca8d10b9a7604` without promoting unfinished visual,
content, media, interaction, or motion changes. Source and artifact gates pass;
browser/performance verification is incomplete. This is not a release approval.
Main and GitHub Pages are unchanged by preparation.

The dependency and license bundle comes from committed feature revision
`34f4f0f810b63c8aa06aac4551bc432095f41c50`. Production media, visual baselines,
Astro configuration, and deployment workflows stay on the public baseline.
Application changes are limited to the approved maintenance fixes below.
No exploratory texture assets or generation command are added.

Following the first browser run and live-baseline control, the approved scope
also includes three minimal accessibility maintenance files: button-scoped
preference selectors, removal of hidden dialog static `autofocus`, and explicit
Continue focus only inside the existing actual-dialog-open branch. These match
the isolated source fixes in feature commits `26504e6` and `beebfd7`; no authored
choreography, layout, assets or content are promoted. The browser harness derives
clipboard permission origin from its configured `baseURL` and explicitly checks
that HTML never receives `aria-pressed`. No assertion is removed or relaxed.

A later, independently confirmed entrance defect adds one bounded motion-source
correction: Full copy uses the existing transforms/timing with `autoAlpha: 1`;
Lite retains its existing vertical/stagger choreography from visible opacity.
The actual H1 and actions are never duplicated or hidden behind presentation.
No duration, easing, scene ownership, decorative Full world motion, or assets
change. Ten phase-observer contracts cover all five products in Full and Lite.

## Advisory evidence

GitHub's authenticated Dependabot API returned 20 open alerts on the default
branch: two critical, eleven high, and seven medium. These include repeated
manifest/lockfile alerts. Nine package families are affected: Astro, Sharp,
Vitest/mocker, devalue, http-cache-semantics, js-yaml, smol-toml, SVGO, fast-uri.

The intended graph pins Astro 7.3.1, Sharp 0.35.5, Vitest/coverage 4.1.11,
Astro Check 0.9.10, and Astro ESLint plugin 2.1.1. Reviewed overrides cover the
transitive vulnerabilities. Node 24.16.0 is synchronized across runtime files,
the manifest, and workspace policy. pnpm remains 11.17.0.

This preparation does not close default-branch alerts. A fresh audit of this
isolated baseline, successful merge/deployment, and GitHub dependency-graph
refresh are required before claiming resolution. The http-cache-semantics alert
currently gives no first-patched identifier and a vulnerable range of
`<=4.2.0`; the candidate pins 4.3.0 and still requires fresh verification.

## Five review lenses

1. **Correctness and edge cases:** dependency files are taken as a coherent
   reviewed bundle, not a mixed art-feature commit. Baseline unit/type/build
   validation passes on the isolated maintenance baseline; feature results did not
   substitute for it.
2. **Architecture and cleanup:** existing lifecycle owners remain unchanged;
   the three accessibility fixes are bounded selector/focus corrections. No
   media record or asset changes. The native Git worktree is isolated from the
   active art-development checkout.
3. **UX, responsive behavior, and accessibility:** unchanged art source does
   not prove unchanged compiler output. Keyboard, entry/focus, comparison, product,
   Reduced/Lite/no-JavaScript, and responsive visual checks remain pending.
4. **Performance, security, and dependencies:** framework/native-image/linter
   changes can affect generated HTML, CSP, CSS, image output, and installation.
   Fresh complete audit, SBOM/license checks and artifact budgets pass. Linux CI
   and baseline Lighthouse verification remain pending; no exception suppresses
   alerts.
5. **Maintainability and release readiness:** README and runtime pins agree;
   the lockfile, reviewed license policy/tests and CycloneDX inventory move
   together. Main push triggers Pages, so promotion requires candidate evidence
   first and deployed smoke checks afterward.

## Verification state

- [x] Baseline and source revision identified.
- [x] Exact dependency/security-file scope inspected.
- [x] GitHub open-alert evidence retrieved without external mutation.
- [x] Frozen installation and formatting/lint/type/unit/build gates.
- [x] Artifact, license/SBOM, provenance and FFmpeg gates.
- [x] Fresh complete dependency audit.
- [ ] Baseline browser, responsive, accessibility and preference checks.
- [ ] Baseline performance/Lighthouse checks.
- [ ] CI approval, merge and successful Pages deployment.
- [ ] Deployed smoke checks and refreshed default-branch advisory evidence.

## Executed isolated evidence

After the competing rendering probe closed, frozen installation and full
`pnpm quality` ran with Node 24.16.0 via `npm exec`/Corepack. Both exited zero;
no application compatibility fixes were required.

- Formatting and ESLint: pass, zero lint warnings.
- Astro Check: 164 files, zero errors, warnings or hints.
- Unit suite: 93 tests in thirteen files; selected-domain coverage is 100%
  statements/functions/lines and 97.31% branches, not whole-application coverage.
- Static build/internal links: 47 pages; transfer and JavaScript budgets pass.
- Content: 38 records; ten media-provenance records; fonts verified.
- CycloneDX inventory and reviewed licenses: 617 components; six SBOM tests pass.
- FFmpeg: pinned `ffmpeg-static@5.3.0`, Windows x64 binary hash
  `04e1307997530f9cf2fe35cba2ca7e8875ca91da02f89d6c7243df819c94ad00`
  verified.
- Separate `pnpm audit --json`: empty advisories and zero info, low, moderate,
  high and critical vulnerabilities; total dependency inventory 617.
- `git diff --check`: pass. Diff against baseline confirms no application,
  media, visual test, Astro configuration or workflow changes.
- Built Uzbek homepage SHA-256:
  `12a54d97f04dbfa667f5d191de0402f47adbdfae3543a707578bc3360ec1cc24`.

## Initial browser evidence and live control

The original dependency-only candidate served on owned port 4333 with the exact
built entry hash verified above. Chromium ran 104 baseline cases without snapshot
updates, timeout changes or excluded assertions: 55 passed and 49 failed. Failures
were 35 HTML `aria-allowed-attr` reports, one skip-link focus failure, one clipboard
origin-isolation failure, and twelve visual-golden mismatches. The run's complete
traces are retained locally. Entry, route, product, motion and no-JavaScript
contracts passed; this does not erase the failures.

A separate browser control inspected the actual published main and candidate.
At 1440px after Continue, both have erroneous HTML `aria-pressed="true"` and
identical thirteen scene heights plus total height 7950px. At 390px in static mode,
both have identical thirteen scene heights plus total height 8334px. Confirmed
static sessions on the live baseline also exhibit the hidden-autofocus Tab-start
race. Both control origins report zero page errors and CSP violations. The large
golden drift is therefore not evidence of a compiler regression by itself;
broader direct baseline comparison and unchanged golden checks remain required.

The patched maintenance candidate requires a fresh quality build and repeat
browser run. No Lighthouse, commit, push, PR, merge or Pages operation has been
performed. The owner checkout and preview remain untouched.

An initial maintenance quality invocation was stopped during lint when another
checkout needed exclusive rendering measurements. Formatting passed before the
stop; this interrupted command is not a maintenance quality pass. No browser or
build runs concurrently with those measurements. The dependency-only quality
and audit evidence above remains separately identified.

## Maintenance quality and direct pixel controls

The subsequent full maintenance `pnpm quality` completed successfully in an
exclusive verification window. It again checked 164 files with zero diagnostics,
93 unit tests, 47 pages, 38 content records, ten media records, 617 SBOM components
and reviewed licenses, the pinned FFmpeg binary, and the dependency audit.
No format/lint/type/build/artifact/audit gate was weakened.

The rebuilt maintenance homepage was verified against the owned HTTP preview;
its SHA-256 is
`bebab15055f561b61412bb3fd80c123248e4aa96e87bfc7ed387a9c739f5f6d5`.

Twelve direct comparisons captured the actual live main and this maintenance
candidate with equivalent static viewport/state/font/image readiness. The eleven
homepage viewports span 320, 360, 390, 412, 430, 844 landscape, 768, 1024 landscape,
1366, 1440 and 1920 CSS pixels; the twelfth captures the contact page lead at 1440.
All images decoded successfully and all capture dimensions match between origins.
Eleven pairs have zero changed pixels; the 1366 homepage pair differs by one
pixel in 8.68 million (maximum channel delta ten). All twenty-four captures have
zero page errors, console errors and CSP violations.

The unchanged existing homepage goldens have different heights from the actual
live main at all eleven sizes. The contact desktop golden differs from live main
by 4.8671% of pixels while candidate-versus-live is pixel-identical. This proves
the twelve recorded golden mismatches predate this maintenance candidate. Goldens
are not updated or declared passing on that basis; the existing visual suite is
still run and its failures remain visible. Local PNGs and decoded font/image and
scene-geometry records are retained under ignored diagnostic evidence.

## Heading availability correction

The first maintenance Chromium repeat ran 104 cases: 91 passed and thirteen
failed. Twelve are the proven stale visual goldens above. The remaining Russian
Zero Axe report is `page-has-heading-one`: the existing entrance temporarily sets
the real heading's copy ancestor to `visibility: hidden` through `autoAlpha: 0`.

A MutationObserver control on both the actual live main and maintenance candidate
confirmed hidden H1/copy with opacity zero in both Full and Lite, followed by
visible opacity one at natural entrance completion. All four probes completed
without page errors. This is a real preexisting semantic-content defect, not a
reason to delay the accessibility scan or exclude its rule.

The approved correction keeps real semantic copy exposed while preserving its
authored transform, stagger and entrance timing. A bounded serialized browser
probe observes all style/mount/entrance phases and validates its recorded data
with Zod. Its mutation observer disconnects on page exit; the page fixture owns
remaining browser resources. No timeline is advanced or forced to complete.
The one mechanical Impeccable detector pass over changed UI sources returned no
findings. The skill's visible-default motion rule supports this narrow repair;
the incumbent visual system is preserved, not redesigned.

The latest full `pnpm quality` now passes after the semantic-copy correction:
165 strict-check files with zero diagnostics, 93 unit tests, 47 pages, and all
artifact, SBOM/license, FFmpeg and dependency gates. Ten new phase-observer
browser contracts pass for all five products in Full and Lite. Actual headings,
actions and copy opacity remain visible through mounted and animated states.

The latest built/served Uzbek entry SHA-256 is
`42a2de839b3c262c142b02da4340bbe8b442b3bd992d9d846faa23c828c6a72c`.
After that correction, a second twelve-case live/candidate static comparison is
pixel-identical in every case, with all images decoded and zero runtime/CSP
errors. This separately verifies that the semantic entrance fix does not alter
the static design before refreshing any visual reference.

## Explicit golden repair and pending promotion

Only after the direct control and phase contracts passed, the maintainer approved
refreshing exactly the eleven stale homepage goldens and contact desktop 1440.
The targeted twelve-case refresh passed. The other three already-passing goldens
are unchanged. A normal 114-case Chromium run (original 104 plus ten phase
contracts), without snapshot updates, returned 114 passed including all fifteen
visual cases. Trace inspection subsequently found two cases did not exercise
their intended page, so this is not complete valid coverage. Firefox/WebKit
focused compatibility and median-three Lighthouse verification remain pending.
No all-green browser or release claim is made before those results.

The maintenance branch may be published as a draft PR for CI review. It must not
merge or trigger Pages promotion before the pending checks and parent review.
Default-branch advisory counts still describe main, not this candidate. GitHub
protection documentation is reproduced from verified configuration revision
`ce87cd3`; its zero required approvals do not imply an independent human review.

### Refreshed golden SHA-256 ledger

All filenames below are in `tests/e2e/visual.spec.ts-snapshots/`.

| Filename                                             | SHA-256                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| contact-uz-page-lead-desktop-1440-chromium-win32.png | `6870bbdfe9e0ff0db87cf296e2393d944fe91d4ac2595cd74b4af72d1c25c8cd` |
| home-uz-compact-320-chromium-win32.png               | `e32c23da89d2290cf7470413c14ce6316d945b45becb9adba8e62b7b08639a55` |
| home-uz-compact-360-chromium-win32.png               | `04878c5e3a060c2fa10b6e2f4c0aa9def9588685c9e16e798949c4f2750969fe` |
| home-uz-desktop-1366-chromium-win32.png              | `403ea24f43272ca86923a2ed38bc55b042a541d10174e055dbd8789200120b74` |
| home-uz-desktop-1440-chromium-win32.png              | `8ba66cc76f621703ad3ba88d270a81d096cd1f5dc0a9fd1a20909ec40dffc2b0` |
| home-uz-landscape-1024-chromium-win32.png            | `98960fa8b93c573b467218e8444bc8c2426e6758958a2d47980f1d068b173f92` |
| home-uz-mobile-390-chromium-win32.png                | `627dadd0a890f848adeefab60c592f451bd561dfe5234df853bcda18e19f4e32` |
| home-uz-mobile-412-chromium-win32.png                | `a04e67a797d05cc346cd0b88239018ea0139d43d37c65dc7ec41aaa76a24b57d` |
| home-uz-mobile-430-chromium-win32.png                | `e2dff7c41bb0306b6545627e9208b983c91bc6b8d27770bdf3c4f3c7af45d4f0` |
| home-uz-phone-landscape-844-chromium-win32.png       | `19cecd7835288b37599877248664d97977a03a00b29e2b25c945aea4f6541cf2` |
| home-uz-tablet-768-chromium-win32.png                | `d6d8195923d8114ca74a69da1628a660926ef1d34b6ac900da0483e07d94c5e6` |
| home-uz-wide-1920-chromium-win32.png                 | `ace8989d2542a3fb2a9df19d25b78901dac5c0efc8c8ceb461279d28e6f2c53d` |

## Trace findings and non-vacuous coverage correction

All 114 retained browser traces were inspected for console errors and page errors.
There are zero page errors. Seven console errors were retained: four expected
network failures from the deliberate media-abort test, one expected unknown-route
404, and two unexpected 404s from the typography boundary fixtures.

The 768/1024 fixtures navigated to `/uz?motion=static` without the required slash
and never asserted HTTP success or a nonempty target set. They incorrectly passed
on an empty collection from a 404 page. Those two cases in the previous 114 count
are invalid intended-page coverage, not proof of successful responsive typography.

The approved correction uses the canonical `expectSemanticPage` boundary (HTTP
success, localized main, one H1 and title) and requires actual column matches
before checking clipping. It preserves both viewport cases and overflow limits.
If the genuine homepage geometry fails, the issue must be reported, not hidden by
an empty query or a weaker threshold. Fresh source and focused browser checks
are required after this correction.

The first nonempty check exposed a second fixture defect: all three former
selector families are obsolete even on the genuine homepage. The approved
fixture now names the four actual editorial families (`.manifesto-intro`,
`[data-product-card] .reactor-copy`, `.home-truth__heading`, `.home-duel__action`).
Every family must exist, paint after its own native scroll, and have a positive
client width and an actual viewport-visible measurement. Measurements are made
before scrolling away from that family, avoiding content-visibility placeholders.
The original one-pixel overflow tolerance remains unchanged. Both corrected
768/1024 Chromium cases pass on real homepage content; no application CSS changed.

The Lighthouse runner additionally adopts the isolated preview lifecycle fix
from `2c9c6b2`: `--ignore-lock` and the child-only `ASTRO_PREVIEW_BACKGROUND` marker.
It does not set a global environment flag, stop the owner preview, alter its dist,
change benchmark routes, lower scores or extend budget thresholds. The runner's
existing report tests and owned profile/Chrome/server teardown remain intact.

## Cross-engine evidence and high-DPI gate

The first focused Firefox/WebKit batch returned 39 passed, 42 explicit existing
Chromium-only skips, and five failures. All five failures are WebKit Full product
entrance callbacks not reached within the unchanged fifteen-second boundary.
Firefox's 22 meaningful cases passed; WebKit's five Lite phase cases and actual
768/1024 geometry passed. Skipped motion/entry tests are not cross-engine proof.

A new engine-neutral suite covers system/user Reduced navigation, native entry
ownership and compact-menu behavior. Its initial explicit `main[inert]` check
was an incorrect representation assumption: native `showModal()` automatically
inerts background content without reflecting that attribute. The corrected
contract checks `:modal`, attempts focus on a positively measured, normally
focusable visible brand anchor, verifies focus remains inside the modal, and
proves the same target accepts focus after Continue. No app inert attributes are
added to satisfy a test.

The semantic phase observer is now scoped/cached so decorative transform updates
do not trigger computed-style measurements. Attribute old values retain inline
opacity/visibility transitions even when restored within a single mutation batch.
Its controlled counterfixture detects the original `autoAlpha: 0` defect in all
three engines without forcing a production timeline. The editorial measurement
helper is split into focused paint, measurement and assertion responsibilities.

However, the reduced instrumentation did not resolve WebKit Full failures. An
initial passive control at default DPR 1 completed in about one second, but that
was not profile-equivalent: `Desktop Safari` uses DPR 2. The matched DPR 2 passive
control—same viewport, screen, UA, locale, color scheme and preference—fails the
natural fifteen-second entrance boundary on BOTH the actual live main and this
candidate (15010/15017 ms), with no observer, recording, page error or console
error. Their world geometry is identical. Therefore this is a preexisting
high-DPI WebKit entrance/performance gate, not proven instrumentation or dependency
regression. DPR is not lowered, callbacks are not forced and timeouts are not
extended to claim a pass. Promotion remains pending parent review and resolution.

## Latest maintenance verification

After the focused helper/fixture corrections, full `pnpm quality` passes with 169
strict-check files, zero diagnostics, 93 unit tests, 47 pages and all artifact,
617-component SBOM/license, FFmpeg and audit gates. Application sources are still
limited to the four approved accessibility corrections; no shadow, grain, raster,
layout, palette or production media modifications are introduced by these tests.

The corrected engine-neutral suite plus historical-opacity counterfixture and
real editorial geometry now passes all 21 cases across Chromium, Firefox and
WebKit. This includes system/user Reduced navigation, actual native-modal focus
blocking with a same-target nonmodal countercontrol, compact menu focus ownership,
three single-batch hidden-opacity sensitivity checks and six non-vacuous geometry
cases. No engine skip applies to these 21 cases. The earlier three incorrect
native-attribute assertions are not counted as application defects or passes.

The serialized semantic observer's outer closure retains nested helpers because
browser init scripts serialize the function without module imports. Its separate
publish, ancestor, historical-style and computed-state responsibilities remain
bounded; this is an explicit decomposition/serialization exception, not a new
production global or a duplicated application implementation. Its original
visibility defect remains detectable, while the matched DPR 2 Full callback
failures remain documented separately.

## Median-three Lighthouse result

The isolated pinned Lighthouse runner completed all nine audits (session 63807)
without concurrent browser tests, then exited 1 because homepage gates failed.
It built the public-readiness artifact separately, verified its served entry
SHA-256 `b0a38feebcde4f0a4f018e4dd802006f8f1ae5dfb8ff175935905892b3dea6a5`,
and used the real GitHub Pages base path. The existing score and timing budgets
were not changed.

| Route            | Median performance / accessibility / best practices / SEO | Median LCP | Median CLS / TBT | Result                                   |
| ---------------- | --------------------------------------------------------- | ---------- | ---------------- | ---------------------------------------- |
| Homepage         | 90 / 100 / 100 / 100                                      | 3615 ms    | 0 / 0 ms         | Fails performance >=95 and LCP <=2500 ms |
| Original product | 99 / 100 / 100 / 100                                      | 2107 ms    | 0 / 0 ms         | Pass                                     |
| Find             | 99 / 100 / 100 / 100                                      | 1884 ms    | 0 / 0 ms         | Pass                                     |

Homepage runs scored 77, 94 and 90, with LCP 3689, 3086 and 3615 ms respectively.
The first run also recorded CLS 0.245431 and TBT 22 ms; a median CLS of zero does
not erase this unstable-run evidence. These measurements alone do not identify
the cause or prove whether the dependency update changed homepage performance.
No new application performance changes are made without a matched control.

The owned Lighthouse preview/debug ports, Chrome profiles and temporary build
were cleaned after completion. The parent preview on 4321, isolated preview on
4333 and its unchanged `42a2de83...` entry artifact remained intact. Source and
focused cross-engine checks above pass, but the homepage Lighthouse and matched
high-DPI WebKit Full entrance gates remain open. Main and Pages remain unchanged;
this draft must not be represented as a completed release.

## Final corrected Chromium batch

The final corrected 119-case Chromium batch (session 15051, one worker, isolated
preview 4333) completed with 118 passes and one failure, exit 1. All 42 route Axe
checks, all 15 normal visual comparisons without snapshot updates, eleven
semantic phase/sensitivity cases, corrected real 768/1024 editorial measurements
and four engine-neutral behavior cases pass.

The remaining route-race test reaches the expected contact URL, focused heading,
CONTACT signal and final idle state, but fails its unchanged runtime-error gate
with `pageerror: Transition was skipped`. Its trace, screenshot and video are
retained. The same case passed in the earlier 114-case batch; neither an
intermittent/preexisting explanation nor a dependency regression is established
by that historical pass. No retry, error filter, timeout change or source repair
is used to conceal the failure. This additional runtime gate remains open for
controlled diagnosis before promotion.

## Bounded responsive-image performance port (verification pending)

The approved port takes only the coherent responsive media changes from
`223e0ba` / `fb1d0d4`: primary and decorative image `sizes`, generator/catalog
160px variants, five existing-art WebP derivatives and their checksum manifests,
plus provenance wording. Actual copied bytes match every committed SHA-256;
the five added files total 100750 bytes. No CSS, source art, palette, choreography
or unrelated `assetsInlineLimit` setting changes.

Five review lenses refined this scoped solution:

1. Correctness: the original proposed primary formula missed the existing
   short-landscape CSS height of 28rem. The first `sizes` condition now declares
   its corresponding 10.76rem intrinsic width before viewport-height branches.
2. Completeness: source candidates, generated files, checksum manifests and
   regeneration widths move together, avoiding nonexistent srcset resources.
3. Visual/accessibility risk: native dimensions, alpha, existing asset rights,
   alt semantics, eager/high-priority primary loading and CSS stay unchanged.
   Derivative decoding and DPR/source-selection quality still need real checks.
4. Performance: Lighthouse previously measured excessive image delivery on the
   real hero, so this addresses an observed payload problem. Lower LCP or a
   passing score is not claimed until the isolated median-three rerun.
5. Release integrity: new unit contracts bind actual compact derivative bytes,
   dimensions and manifests, plus landscape declaration priority. Full quality,
   browser comparisons and measured source selection are pending; existing
   font CLS, route-race error and DPR2 WebKit gates are not silently resolved.

The font-shift report already identifies both preloaded Latin font faces; no
duplicate preload or unmeasured font-display/fallback change is included. The
route-race trace records native AbortError with an empty browser stack. Astro's
transition promise handling is a hypothesis needing a matched control, not a
reason to filter errors or change unrelated routing code in this port.

### Image-port measured result

Full quality session 67265 passes: 170 strict-check files without diagnostics,
99 unit tests in fourteen files, 47 pages and all unchanged provenance, font,
budget, 617-component SBOM, FFmpeg and audit gates. The six added tests bind
actual 160px derivative integrity and landscape declaration priority.

Twelve isolated source-selection contexts cover portrait 390x844, tablet
768x1024, short landscape 844x390 and desktop 1440x900 at DPR 1 / 1.75 / 2.
All sixty hero images decode, every selected source width meets or exceeds its
actual computed CSS width times DPR, and no page error occurs. Primary portrait
sources are 160 / 320 / 320px; desktop sources are 320 / 480 / 480px. All fifteen
normal Chromium visual comparisons pass (session 61152), with no golden update.

The isolated nine-audit Lighthouse rerun (37048) completes and exits 1, retaining
the unchanged LCP gate: homepage medians are 97 / 100 / 100 / 100 with LCP
2564.382 ms, CLS 0 and TBT 0. This improves the preceding median 3615.335 ms but
still exceeds 2500 ms. Detail and Find remain passing at 99 / 100 / 100 / 100,
LCP 2107.933 / 1886.220 ms. Homepage run one again has CLS
0.2454311948390134, TBT 84.41425 ms and LCP 2575.75725 ms;
median zero is not an all-run stability claim. Font metrics, native route-race
promise ownership and high-DPI WebKit still require their separate causal work.

The normal isolated artifact and served entry match SHA-256
`4dfe5d9be9416e1a2a5341d556acd7cbeb32ecad7bcc008d2d9cf5f05fe68ecf`;
the separately audited public-base artifact is
`e6731569a213bb40b2bb95e707d948bb64c28dc90f38b81fa5afec9f520939ad`.
Owned audit ports/profiles/build are cleaned; parent 4321 and isolated 4333 remain
untouched. No passing release or closed default-branch advisory claim is made.
