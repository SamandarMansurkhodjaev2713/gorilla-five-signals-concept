# Entry paint and Material Film: five-lens review

Status: implementation verified locally; complete release acceptance remains open.

## Outcome and scope

Remove painting behind the already opaque responsible-entry checkpoint, and
remove repeated style/layout resolution from the finite Material Film entrance.
Keep the approved composition, warning, copy, media behavior and Full/Lite motion
schedule. No asset, dependency, CSP, environment or publication-policy change.

Local frozen entry SHA-256:
`b25ad5c7c103a8578a002857c4d1ac0b38d3ae9bdfd644772c2d95be0b8c5038`.
Old baseline entry:
`851574d4b1b934529762fc05d761c7a66aa9a9c20c795a8edd9f12e6a2c1fd01`.

## 1. Correctness and edge cases

The checkpoint's SSR `[open]` state owns the visibility of only the underlying
skip link, header, main and footer. `visibility:hidden` preserves their layout;
it does not collapse content, postpone enhancement or change image discovery.
Closing the native dialog synchronously releases the rule. The no-JS override
is mandatory because hiding the dialog with `display:none` does not remove its
SSR `open` attribute. Without that override the page would remain hidden.

Material Film retains ten cues and a 640ms terminal time in both tiers. One
timing specification drives native and fallback schedules. Unsupported native
API/easing or custom inline presentation uses GSAP. Unexpected failures are
diagnosed, not swallowed. Unit cases cover partial setup, aggregate failures,
synchronous completion, repeated starts, late callbacks and teardown.

## 2. Architecture, coupling and cleanup

Reactor and Film now use one feature-neutral finite player and sampled easing.
Reactor is a small typed adapter preserving IDs, messages and lifecycle. Film's
native plan queries its scoped targets but performs no computed-style/geometry
reads. Effects are created idle, then share one document-clock origin.

The fallback owns a nested GSAP context. Cancel it before restoring exact inline
declarations/priorities through the existing shared snapshot helper; clearing
arbitrary properties or restoring before parent reversion is unsafe. All effects,
finish listeners and fallback contexts have one idempotent owner. The neutral
modules remain explicitly included in coverage after extraction.

## 3. UX, responsive behavior and accessibility

All 24 new entry-paint cases pass without retries/skips in Chromium, Firefox and
WebKit: phone/desktop, home/product, fresh modal, synchronous native Continue,
focus/scroll, confirmed reload, real legal navigation/back, unconfirmed locale
change, no-JS fallback and isolated layout geometry. The CSS isolation test is
explicitly synthetic, not native-input/performance evidence; the Continue and
navigation cases use real controls.

Native Chrome viewport captures at 390×844 and 1440×900 preserve the actual
first screen, confirmed content and no-JS fallback. The two no-JS PNGs and the
desktop confirmed PNG are byte-identical to the old captures. No new screenshot
golden was accepted to conceal a layout change. These captures are not full-site
or physical-device visual acceptance.

Material controlled comparison covers three engines × Full/Lite × phone/desktop:
12 cases, seven milestones, 84 poses over ten targets each. Actual native prefix
effects are required. Maximum geometry/matrix delta is zero, opacity 0.000229,
resolved inset edge 0.0112px, within unchanged 0.5px/0.0025/0.25px bounds.
All 400 raw clip-string representation differences remain in the raw report;
finite inset parsing resolves them without accepting unknown grammar.
All twelve public rewind/play sequences subsequently finish naturally, clear
owned effects and restore eight exact inline baseline declarations. No errors.
Seeking/rewinding is controlled functional evidence, not FPS or native-user input.

## 4. Performance, security and dependency risk

Before: hardware CPU×4 attributed Film observer startup at 46.5/33.1/29.7ms, with
nine style updates/eight layouts each time. The native implementation removes
the measured read/write pattern without shortening motion or adding a delay.
After-measurement must still prove callback cost and complete-journey behavior;
source inspection alone cannot establish smoothness.

Hardware Chrome CPU×4 tracing now records Material callbacks at
12.269/4.324/5.463ms with zero style-tree updates and zero layouts inside each
callback, versus 46.453/33.141/29.696ms and 9/8 before. Film passes its 16ms
callback target in all three runs. Cold wrapper attribution uses actual scene
order/geometry, not the misleading inferred `IntersectionObserver.rootMargin`
name or simply the highest-ranked callback.

Remaining cold callbacks still fail: Manifesto 23.652/23.272/22.727ms and Culture
55.519/10.583/25.015ms; selection application callbacks reach
14.145/22.437/32.376ms. Blank-URL Playwright RAF instrumentation is excluded from
those application figures. Film's improvement is not global frame acceptance.
Raw hardware evidence: `.tmp/cold-entry-material-2026-10-25/`.

The separate canonical three-session CPU×4 journey also remains failed, using
the unchanged 2500ms tail and hard 16/50/200ms limits. Maximum application work
inside observed Long Animation Frames, milliseconds:

| Phase | Run 1 | Run 2 | Run 3 |
| --- | ---: | ---: | ---: |
| Confirmation/startup | 5.7 | 36.8 | 0.3 |
| Cold scroll | 63.1 | 35.8 | no LoAF recorded |
| Product selection | 20.5 | 11.1 | 20.8 |

Startup long tasks reach 68/54/none ms; selection long tasks 90/50/54ms.
Selection Event Timing maxima are 200/112/120ms. Run 1 startup/selection LoAF
blocking also reaches 21.2/44.7ms. No recorded LoAF is not zero frame work or a
pass inferred from missing observations. The renderer is the separate bundled
Chromium software profile, not the hardware Chrome attribution above.
All fifteen phase and three environment/artifact payloads remain in the HTML
report ZIP: `.tmp/entry-material-performance-report-2026-10-25/index.html`;
log `.tmp/entry-material-performance-2026-10-25.log`.

The entry paint change removes work only behind an already fully opaque modal.
It does not remove visible content for an audit, delay below-fold work beyond
measurement or waive confirmed-startup performance. Fresh and confirmed entry
remain independent acceptance paths. The earlier nine Lighthouse reports are
preserved in `.tmp/lighthouse-native-reactor-baseline-8062518/` before rerunning
the canonical harness; summary checksum was verified after the copy.

### Public-readiness Lighthouse: still failed

Nine audits ran against the public-base-path artifact SHA-256
`c96ecae8d8ce63b289d326f24c8f67937a5dd8a3ef18fc25048c9164926b2513`.
Three-run medians:

| Route | Performance | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: |
| Uzbek home | 91 | 3472ms | 56.5ms | 0 |
| Original product | 99 | 2188ms | 0ms | 0 |
| Find | 99 | 1962ms | 0ms | 0 |

All audited accessibility/best-practices/SEO scores are 100, not manual or device
acceptance. Home runs score 91/98/91 with simulated LCP 3483/2410/3472ms; the
median still fails the unchanged 95/2500ms gate. The single faster run is not
selected as acceptance. The runner exits 1; main/Pages remain unchanged.

All three new audits select the visible entry-age text as LCP, not the underlying
Hero image. Its observed trace LCP is 408/349/341ms. These observed local values
must not replace the canonical Lighthouse mobile simulated values. The text-only
breakdown no longer includes Hero image discovery/load phases. Critical CSS is
inline (zero CSS network requests), both fonts are discovered at high priority,
and CLS remains zero. No critical-CSS discovery defect is established by these
reports. Font/ClientRouter work and Lantern simulation vary between traces; this
is a stability concern to investigate, not permission to waive the median gate or
defer the required early product-history bridge without an ordering-safe design.
Raw reports/traces and summary: `test-results/lighthouse/`; log:
`.tmp/lighthouse-entry-material-2026-10-25.log`.

## 5. Maintainability, documentation and release readiness

Source/artifact gate passes with 317 strict files, strict browser bootstrap,
396 unit tests, a 47-page build, budgets, fonts, provenance, 617-component SBOM
and zero candidate advisories. Global coverage thresholds are unchanged;
statements 97.62%, branches 94.94%, functions 100%, lines 98.12%.
This does not describe the unchanged public main's advisories.
ADR-0012 and the architecture map document the shared native boundary.

Private evidence:

- `.tmp/quality-entry-material-2026-10-25.log`;
- `.tmp/entry-paint-cross-engine-2026-10-25.log`;
- `.tmp/entry-material-ownership-2026-10-25.log` (16 passes, two pre-existing
  non-Chromium exclusions in the older lower-home contract; no new skips);
- `.tmp/entry-paint-{before,after}-2026-10-25/`;
- `.tmp/material-film-controlled-gsap-baseline-8062518.json`;
- `.tmp/material-film-native-vs-frozen-gsap-2026-10-25.json` and summary.

Main/Pages remain held until the user's stated smoothness/Lighthouse condition
and the complete release gates are satisfied. This review is not a deployment.
