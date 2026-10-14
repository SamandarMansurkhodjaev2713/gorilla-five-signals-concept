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
contracts), without snapshot updates, is currently pending completion; it includes
all fifteen visual cases. Firefox/WebKit focused compatibility and median-three
Lighthouse verification are also pending. No all-green browser or release claim
is made before those results.

The maintenance branch may be published as a draft PR for CI review. It must not
merge or trigger Pages promotion before the pending checks and parent review.
Default-branch advisory counts still describe main, not this candidate. GitHub
protection documentation is reproduced from verified configuration revision
`ce87cd3`; its zero required approvals do not imply an independent human review.

### Refreshed golden SHA-256 ledger

All filenames below are in `tests/e2e/visual.spec.ts-snapshots/`.

| Filename | SHA-256 |
| --- | --- |
| contact-uz-page-lead-desktop-1440-chromium-win32.png | `6870bbdfe9e0ff0db87cf296e2393d944fe91d4ac2595cd74b4af72d1c25c8cd` |
| home-uz-compact-320-chromium-win32.png | `e32c23da89d2290cf7470413c14ce6316d945b45becb9adba8e62b7b08639a55` |
| home-uz-compact-360-chromium-win32.png | `04878c5e3a060c2fa10b6e2f4c0aa9def9588685c9e16e798949c4f2750969fe` |
| home-uz-desktop-1366-chromium-win32.png | `403ea24f43272ca86923a2ed38bc55b042a541d10174e055dbd8789200120b74` |
| home-uz-desktop-1440-chromium-win32.png | `8ba66cc76f621703ad3ba88d270a81d096cd1f5dc0a9fd1a20909ec40dffc2b0` |
| home-uz-landscape-1024-chromium-win32.png | `98960fa8b93c573b467218e8444bc8c2426e6758958a2d47980f1d068b173f92` |
| home-uz-mobile-390-chromium-win32.png | `627dadd0a890f848adeefab60c592f451bd561dfe5234df853bcda18e19f4e32` |
| home-uz-mobile-412-chromium-win32.png | `a04e67a797d05cc346cd0b88239018ea0139d43d37c65dc7ec41aaa76a24b57d` |
| home-uz-mobile-430-chromium-win32.png | `e2dff7c41bb0306b6545627e9208b983c91bc6b8d27770bdf3c4f3c7af45d4f0` |
| home-uz-phone-landscape-844-chromium-win32.png | `19cecd7835288b37599877248664d97977a03a00b29e2b25c945aea4f6541cf2` |
| home-uz-tablet-768-chromium-win32.png | `d6d8195923d8114ca74a69da1628a660926ef1d34b6ac900da0483e07d94c5e6` |
| home-uz-wide-1920-chromium-win32.png | `ace8989d2542a3fb2a9df19d25b78901dac5c0efc8c8ceb461279d28e6f2c53d` |
