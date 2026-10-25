# QA status

## Footer-only finite native entrance — 2026-10-25

Footer is now the sixth adapter over the shared finite native player and
exact-snapshot owner. Its six signal targets retain the original 0/40/80/120/160/200ms
schedule, 260ms duration, snap easing and 460ms terminal time. Responsible-entry
and the generic GSAP signal helper are unchanged; unsupported, malformed,
copy-bearing or custom-inline Footer states keep the scoped GSAP fallback.
The global scene registry applies this adapter to the shared SiteFooter wherever
it is rendered; the controlled matrices and hardware traces below exercised the
homepage instance.

The final post-split source/artifact gate passes formatting, lint, 356 strict
files, 462 units, coverage of 96.79% statements, 93.95% branches, 97.42%
functions and 97.67% lines, the 47-page build, artifact verification, the
617-component SBOM and high-severity dependency audit. The entry-document
SHA-256 is
`91962ea9f6c37b9fc748b1381c98277edef073f7b923f09108897ecb18b3d2bb`.

The controlled matrix passes 12 native/GSAP pairs and 24 captures across Chrome,
Firefox and WebKit, Full/Lite and 390/1440px with zero out-of-budget numeric
differences. Maximum rect delta is 0.067749px and matrix-linear delta is
0.0000646678; translation, opacity and clip deltas are zero. Exact
eight-property inline restoration on both backends and natural cleanup pass
24/24; font metadata matches and no application or cleanup error is recorded.

Three hardware CPU×4 traces measure the Footer callback at
7.283/4.623/9.104ms, all below 16ms with zero nested `UpdateLayoutTree`,
`Layout` or forced-style/layout work. The prior callback was
24.670/23.119/23.211ms with 11 style updates and five layouts in every run. This
accepts the bounded callback only: run one still records a later 59.2ms y=8000
frame with no attributed script, and the page-wide gate remains failed.
Product-area callbacks remain above 16ms; Manifesto and Culture each breach
once; FAQ y=6720 frames remain 170.3/206.3/172.8ms.

The initial combined functional batch preserved under
`.tmp/footer-functional-before-split-2026-10-25/` passed 35/36. Chromium Full at
1440px reached the unchanged 45-second watchdog after all five entrances and
the pause completed, during the following Reduced Material style assertion. No
application or assertion failure was observed before timeout. A tests-only
scenario split retained every timeout and assertion, then passed 48/48 in 2.8
minutes with exit 0, no retries and no skips: 12 Footer cases, 12 original
four-scene cases and 24 entry-paint cases. Evidence:
`.tmp/footer-functional-split-2026-10-25.log`. This is a harness scheduling fix,
not an application fix; the production SHA remains unchanged.

The canonical Lighthouse batch passes all nine audits with exit 0 and no
failures. Its isolated audit entry SHA-256 is
`b4493037596752fe1c2578574e4a93032c98487e7591dbf758ef968217ac97be`;
the local production artifact remains the separate unchanged `91962…d2bb` SHA.
Home Performance is 98/98/98. LCP is 2337.84/2414.34/2334.32ms, with a
2337.84ms median; TBT is 78/37.5/34.5ms, with a 37.5ms median; CLS is 0.
Product and Find Performance medians are 99; their LCP medians are 2186.76ms
and 1959.09ms with 0ms median TBT. Accessibility, best practices and SEO are
100 in all nine audits. All five secondary-image hints are Low with zero
promotions in every home run, and the responsible-entry age text remains LCP.
Evidence: `.tmp/lighthouse-footer-2026-10-25.log`,
`test-results/lighthouse/summary.json` and
`.tmp/lighthouse-footer-image-priority-2026-10-25.json`.

The FAQ intrinsic-size CSS control is retained as a rejected production fix: it
partially lowers some layout samples but does not consistently remove the
full-document render tail. No production CSS changed. See the
[FAQ render-tail diagnostic](FAQ_RENDER_DIAGNOSTIC_2026-10-25.md) for the next
evidence boundary. Complete-journey, physical-device, assistive-technology,
legal and publication gates remain open; Main/Pages stay held. See the
[five-lens review](FOOTER_NATIVE_REVIEW_2026-10-25.md) and
[ADR-0015](../decisions/ADR-0015-footer-native-ownership.md).

## Native Service and discovery-priority candidate — 2026-10-25

Service Dock is now the fifth adapter over the shared finite native player and
exact-snapshot entrance owner. Its existing Full/Lite choreography remains in
the feature adapter and GSAP remains the guarded fallback. Separately, the four
lazy Hero ghost products and below-fold Manifesto carrier declare explicit Low
fetch priority; the primary Hero product remains eager/high.

The frozen source/artifact gate passes formatting, lint, 344 strict files, 449
units, coverage, the 47-page production build, budgets, content, provenance,
licenses, the 617-component SBOM and high-severity dependency audit. The build
entry-document SHA-256 is
`184868e03ac73b881af12367bcfb5122403f6f78d1a150f1618afdd1cea36668`.

The canonical nine-run Lighthouse batch passes on audit entry SHA-256
`377c5c4ef5e93d4a304bceed2de84b11a07898814da5d6f03c04d90ed196f6a5`.
Home Performance is 97/98/98, LCP is 2340.865/2258.804/2337.968ms, median TBT
is 69ms and CLS is 0. Product and Find Performance medians are 98 and 99; their
LCP medians are 2190.923 and 1961.197ms, with 0ms median TBT. Accessibility,
best practices and SEO are 100 in all nine audits. All five targeted images now
begin Low with an explicit Low hint and record zero promotions before LCP in all
three home runs; the preserved baseline pattern was 5/0/5. Home median LCP moves
from 3472.275ms to 2337.968ms. This is bounded canonical Lighthouse evidence,
not INP, frame-rate, physical-device or complete-journey acceptance.

The controlled Service matrix passes 12 native/GSAP pairs and 24 captures across
three engines, Full/Lite and 390/1440px. Natural cleanup and exact eight-property
inline restoration pass 24/24, font metadata is equal, and application/cleanup
errors are zero. Maximum rect/matrix deltas are zero, opacity delta is 0.000064
and clip delta is 0.029357px under unchanged budgets. The capture process saved
the successful matrix before an obsolete Terminal-only reporter exited 1; the
standalone JSON comparator passed the saved artifact with exit 0. That harness
defect is recorded rather than misreported as an application failure.

Three hardware CPU×4 traces measure the Service callback at
10.005/9.007/11.388ms, passing 16ms in all runs with zero nested style-tree,
layout or forced-style/layout work. Its median changes from 29.193ms to
10.005ms. This accepts the bounded callback, not the frame: containing frames
remain 155.2/106.9/112.8ms with 93.8/46.5/56.0ms blocking work and long render
and style/layout tails. Footer, a Product-labelled boundary and one Manifesto
run also remain over budget. Exact Product ownership is not inferred from the
boundary label.

The unchanged artifact passes all 36 combined functional cases with exit 0 and
no retries or skips: 12 extended native-home cases covering all four scenes and
24 entry-paint cases across all three engines, Full/Lite, 390/1440px, pause,
Reduced, exact inline cleanup, entry reload, route/back, no-JS and locale.

The independent Footer callback and wider journey remain open. INP, physical
device and release gates are not implied by the bounded passes. Main/Pages stay
held under the user's publication condition. See the
[five-lens review](SERVICE_PRIORITY_REVIEW_2026-10-25.md) and
[ADR-0014](../decisions/ADR-0014-native-service-and-discovery-priority.md).

## Adaptive native home entrances — 2026-10-25

Manifesto and Tashkent Terminal now join Reactor and Material Film on the shared
finite native player and exact-snapshot entrance owner. Full/Lite choreography,
terminal timing, reduced/no-JS visibility and the scoped GSAP fallback remain
intact. Adaptive sampled easing replaces the rejected uniform 513-stop curves;
operation-local public `KeyframeEffect` copies avoid reparsing identical effects
without retaining targets across scenes, documents or route lifetimes. Unsafe
or side-effectful frames bypass reuse and remain browser-validated.

The current artifact SHA-256 is
`577dd60a1cd70b3a56c84d003b2a892019eb5d5fdfc5e87389f079de7840434b`.
The complete source/artifact gate passes formatting, lint, 335 strict files, 435
units, production build, budgets, content/fonts/provenance, 617-component SBOM,
licenses and high-severity dependency audit. The final current-hash browser run
passes all 27 cases without retries or skips: 12 native home entrances, 12 Reactor
cleanup cases and three product/route history cases across all three engines.
Full/Lite use 390/1440px viewports. Entrance tests observe real native
start/finish/cancel events rather than racing a post-completion effect query.

The first adaptive parity matrix exposed a WebKit 390px heading rebalance at
natural cleanup. A controlled eight-case experiment confirms that stable
`text-wrap: wrap` removes the discrepancy with maximum rect delta 0.0111px; the
production Terminal heading adopts that rule. The final current-hash matrix then
passes 24 scene comparisons (12 matched backend pairs × two scenes) and 48
scene/backend captures across three engines, Full/Lite and 390/1440px with zero
differences. Natural cleanup passes 48/48 and exact inline restoration 24/24.
Maximum rect/opacity/matrix-linear/matrix-translation/clip deltas remain within
their unchanged bounds. This is controlled parity and cleanup evidence, not
native-input or FPS acceptance.

Uniform 513-stop hardware CPU×4 callbacks failed 16ms. Adaptive sampling brings
Manifesto and Material below 16ms in all three runs, while Terminal still records
one 20.806ms breach. The following copy-reuse artifact records Manifesto at
17.801/13.098/21.664ms, Material at 6.530/5.967/5.659ms and Terminal at
7.952/13.064/4.176ms, with zero nested style-tree updates/layouts. Manifesto
still fails two runs, and the cross-run variance does not prove that reuse caused
an overall improvement. Three still-unattributed Product/Store/Contact boundary
callbacks also remain over budget; those labels do not prove exact feature
ownership. The trace predates the final fail-closed key correction and is
diagnostic, not current-hash performance acceptance. Canonical Lighthouse,
complete-journey, physical-device and release gates remain open. Main/Pages
remain held. See the
[five-lens review](NATIVE_HOME_ENTRANCES_REVIEW_2026-10-25.md) and
[ADR-0013](../decisions/ADR-0013-native-home-entrances.md).

## Entry paint and native Material Film — 2026-10-25

The opaque responsible-entry checkpoint now excludes its occluded page siblings
from painting without collapsing layout. Continue restores visibility in the
same task; no-JS explicitly restores content despite SSR `open`. All 24 new
cross-engine cases pass without retries/skips, including focus, native route
navigation, reload, locale, geometry and no-JS. Phone/desktop visual captures
preserve the approved composition.

Material Film now uses the shared finite native player with its complete ten-cue
640ms Full/Lite schedule. Twelve controlled cross-engine comparisons pass, with
natural completion and exact cleanup. Hardware CPU×4 callback costs improve
from 46.453/33.141/29.696ms to 12.269/4.324/5.463ms; repeated style/layout reads
fall from nine/eight to zero/zero. All three callbacks pass 16ms. Sixteen existing
ownership/history/lower-home cases also pass; two older engine exclusions remain
unchanged. Source/artifact checks pass 317 strict files, strict bootstrap, 396
units, 47-page build, budgets/provenance/fonts/SBOM and candidate audit.

Complete-journey acceptance remains failed: other cold scenes and selection
callbacks exceed 16ms; startup/selection still record long tasks. Nine new
Lighthouse audits yield home Performance 91 / LCP 3472ms, product 99 and find 99
(three-run medians). All audited accessibility/best-practices/SEO scores are 100.
The visible entry text now correctly becomes LCP, but local observed paint does
not waive the failed canonical mobile simulation. The previous intermittent
WebKit fallback failure is not declared fixed merely because this batch passed.
Main/Pages remain held under the user's explicit publication condition.
See the [five-lens review and measurement scope](ENTRY_PAINT_MATERIAL_REVIEW_2026-10-25.md)
and [ADR-0012](../decisions/ADR-0012-shared-finite-native-entrances.md).

## Native Reactor presentation candidate — 2026-10-25

The local candidate moves finite Reactor playback to owned native effects after
a guarded, all-reads-before-writes setup; GSAP remains the unsupported-style/API
fallback. Full/Lite timing and exact cleanup are preserved. Controlled pose
comparison passes in Chrome, Firefox and WebKit, including mid-shard motion.
This is not frame-rate or device acceptance.

Source/artifact checks pass: 309 strict files, strict classic bootstrap, 377 units,
production build, budgets, fonts, provenance, SBOM and zero candidate advisories.
The first real browser batch passed 56 cases and failed one WebKit Lite desktop
cleanup after rapid keyboard/history input. Seven isolated repetitions then
passed without a production change; the original intermittent failure remains
open, with diagnostic evidence retained rather than reclassified as success.

The user explicitly chose to update the public site only after the outstanding
smoothness and Lighthouse issues are fixed. Main/Pages are unchanged. The new
complete-window CPU×4 journey still fails: cold-scroll application work peaks at
23.2/12.4/44.9ms and selection at 9.4/12.8/24.8ms; run 3 also reaches a 224ms
interaction and 144ms long task. Independent hardware callback attribution also
exceeds 16ms. A separate 1000-event synthetic resource stress stays within 12
owned effects, naturally clears effects/leases and shows constant player counts
at three GC checkpoints; it does not prove zero total heap growth or frame rate.
Nine public-readiness Lighthouse audits fail the homepage gate: median
Performance 90 and LCP 3475ms. Product/find medians are 98/99, but a product run
also records a 797.6ms TBT outlier; stability is not declared solved. All audited
accessibility/best-practices/SEO scores are 100. Final release/device acceptance
remains open. See the
[five-lens review and measurement scope](REACTOR_NATIVE_PLAYER_REVIEW_2026-10-25.md),
[candidate design and acceptance plan](../motion/REACTOR_NATIVE_PLAYER_PLAN.md)
and [ADR-0011](../decisions/ADR-0011-reactor-native-presentation-player.md).

## Reactor presentation and native history ownership — 2026-10-25

Flavor transitions now restore exact authored declarations/priorities, stop only
owned work and preserve visible outgoing content during preparation. Native
product back/forward no longer replaces the home DOM or resets scroll; actual
route navigation remains Astro-owned. The early external history bridge keeps
the self-only script CSP and has its own strict browser-script check.

Final source/artifact checks pass: 296 strict files, the classic-bootstrap type
check, 315 units, production build, provenance/SBOM/budgets and candidate audit.
All 57 executed focused browser cases pass without retries, including fifteen
cross-engine ownership/history cases and forty-two existing Chromium functional
contracts. Existing non-Chromium exclusions are recorded, not newly introduced.
See [five-lens review, rejected prototypes and evidence](REACTOR_TRANSITION_REVIEW_2026-10-25.md).

The complete-window CPU×4 journey remains failed: startup and cold-scroll app
work exceed 16ms, as do two selection runs. Selection Event Timing maxima were
128/152/112ms in that lab run, not a real-user INP guarantee. Observation now
includes 2500ms rather than truncating the 2256ms Full choreography at 960ms.
Native-player work is an explicitly
[measured candidate](../motion/REACTOR_NATIVE_PLAYER_PLAN.md); the newer section
above records its current incomplete acceptance.
Lighthouse, full device/release acceptance and main/Pages publication remain open.

## Owned target-level Hero preparation — 2026-10-25

Full Hero preparation now executes one target per cancellable frame while
preserving SSR poses until playback. Fixed false Full readiness after startup
failure and obsolete-generation fallback; teardown invalidates only touched
caches and restores exact original declarations. Source checks pass 289 strict
files, 282 unit tests, production build, artifact checks and dependency audit.
All 42 targeted lifecycle/preparation/native-scroll cases pass without retries
across Chromium, Firefox and WebKit. See the
[five-lens review, unsuccessful iterations and scope](STAGED_HERO_REVIEW_2026-10-25.md)
and [ADR-0008](../decisions/ADR-0008-owned-staged-scene-activation.md).
Complete motion performance, mobile visual/device QA and Lighthouse gates remain
open. Main/Pages publication remains held; this correction is not release approval.

## Consumer typography and mobile action fit — 2026-10-25

Removed the untranslated range calibration eyebrow and restored its full-row
mobile display heading. Fixed measured WebKit store/contact text overflow using
available-width tracks and fluid mobile type; increased action leading to 0.95
after native 320px inspection. Compact Hero SSR image sizing now matches 40svh.
Source quality passes 273 strict files, 249 units, 47-page build, artifact checks
and dependency audit. All 48 strengthened cross-engine heading/outro contracts
pass without retries/skips, including three languages, 200% text and native no-JS
footer activation. Earlier failures and exact diagnostic scope remain recorded.
All 42 existing Chromium Reactor functional contracts also pass against the final
artifact: seven viewport contexts, all products, history, keyboard, reduced
motion, interruption and no-JS parity.
See [five-lens review and evidence](CONSUMER_TYPE_REVIEW_2026-10-25.md).
Full device/assistive-technology, startup/Lighthouse and release gates remain
open; main/Pages are not updated by this branch correction.

## Hero first-fold availability — 2026-10-25

Corrected clipped primary actions on ordinary phone/desktop viewports without
reducing display typography or removing the warning. Actions no longer inherit
the entry support animation's hidden state. Native Chrome screenshots confirm
the corrected 320/390/1440 layouts; a separate design-agent review found no new
cropping. Source quality passes 271 strict files, 248 units, 47-page build,
artifact checks and audit. Browser coverage: 125 initial passes and six focused
confirmation passes, covering 129 distinct cases across three engines; the four
initial failures and their resolution remain documented. See
[five-lens review and exact evidence](HERO_FIRST_FOLD_REVIEW_2026-10-25.md).
Full motion/performance acceptance and main/Pages publication remain open.

## Native exit and reload-position hardening — 2026-10-25

Hero exit no longer applies backwards fill before its range; paired desktop
geometry is unchanged, with a modest/noisy timing improvement rather than a
performance cure. Reload uses a validated one-use same-path session handoff,
bounded cancellable restoration and one actual-layout-ready correction. Menu
focus preserves background position. Source quality passes 270 strict files,
248 units, build/artifact checks and audit. Forty-one targeted browser cases
pass; four pre-existing route cases remain explicitly skipped. See
[evidence, failed iterations and scope](HERO_EXIT_RELOAD_REVIEW_2026-10-25.md)
and [ADR-0007](../decisions/ADR-0007-reload-scroll-ownership.md).
No public deployment or full performance/release acceptance is implied.

## Hero style ownership and failed-setup rollback — 2026-10-25

Full/Lite teardown now restores the Hero's original inline declarations after
GSAP reversion and invalidates normalized transform caches. Partial scene setup
also obtains a registered context before rollback; readiness/styles are owned
before initialization can fail. Source checks pass 264 strict files, 197 units,
47-page build/artifact verification and dependency audit. Twenty-one focused
cases pass across three engines, covering capability cycles, resize, injected
setup errors and menu mouse/touch activation. See [scope, five review lenses
and limitations](HERO_STYLE_OWNERSHIP_REVIEW_2026-10-25.md).
Full release and performance acceptance remain open; this is not a deployment.

## Native menu activation correction — 2026-10-25

Fixed a real pressed-target displacement: menu entrance cleanup moved the pause
button between pointer press/release, causing a click on its surrounding
fieldset. Preserve geometry during activation and settle through owned work.
All six new mouse/touch cases pass across three engines; six existing Chromium
navigation/interruption/Lite regressions also pass. Source quality passes
261 strict files, 190 units, build/artifact checks and dependency audit.
See [native input evidence and five review lenses](MENU_POINTER_ACTIVATION_REVIEW_2026-10-25.md).

Removed duplicate reactor preparation resets; 42 existing Chromium catalog
contracts pass. The final unchanged CPU ×4 gate still fails across three
sessions, so smoother playback and production readiness are not established.
See [measured scope and remaining performance work](REACTOR_PREPARATION_REVIEW_2026-10-25.md).

## Measurement correction — 2026-10-25

The motion harness now requests its documented CPU ×4 instead of ×1, records
validated rendering/build context and owns preview in the foreground. Three
complete sessions failed existing frame/long-task limits; their Chromium
renderer was SwiftShader software, not the separate Chrome Lighthouse GPU
environment. Windows Playwright WebKit also explicitly disables accelerated
compositing. Neither result proves physical Safari performance, nor excuses
functional failures. See [evidence and interpretation boundaries](BROWSER_MEASUREMENT_CONTEXT_2026-10-25.md).
The current Lighthouse and full release gates remain open; no production
acceptance or public deployment is implied by the harness correction.

## Native entry experiment — 2026-10-25

The four-case GSAP/native-driver comparison does not prove smoother playback;
the prototype remains private and is not adopted. Entry configuration is now
geometry-only and the emitted runtime/product page remain byte-identical.
Four new unit contracts bring the passing source count to 181. See the
[experiment, five review lenses and limitations](NATIVE_ENTRY_DRIVER_REVIEW_2026-10-25.md).

## Latest comparison cleanup — 2026-10-25

Removed pseudo-technical comparison labels and corrected FAQ guidance. Fixed the
three-selection mobile grid specificity defect and narrow-screen can fit.
Twelve new cross-engine artwork checks pass at 320/360/390/768. Source quality,
177 units, 47-page build and audit pass; full browser/release acceptance does
not. See [current scope and remaining failures](COMPARE_CONSUMER_REVIEW_2026-10-25.md).

## Latest material refinement — 2026-10-25

The current branch replaces concentric grain gradients with a small original
texture and removes the redundant moving dot blend. Thirty focused browser cases
pass across three engines. The Original metal follow-up replaces the large
blurred slab shadow with local gradient shading; all 36 focused grain/lighting
cases pass. Canonical Lighthouse still fails homepage/product performance.
See [scope, five review lenses and performance
limitations](MATERIAL_GRAIN_REVIEW_2026-10-25.md). WebKit motion and stable
Lighthouse acceptance remain open; this is not a production release approval.

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
