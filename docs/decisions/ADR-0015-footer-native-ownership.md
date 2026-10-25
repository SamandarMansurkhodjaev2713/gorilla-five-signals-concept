# ADR-0015: Footer-only finite native entrance ownership

Status: bounded source, controlled parity and hardware callback gates pass;
complete-journey and release gates remain open.
Date: 2026-10-25.

## Context

Three hardware Chrome CPU×4 traces attribute the Footer's finite GSAP entrance
callback at 24.670/23.119/23.211ms. Every run performs 11
`UpdateLayoutTree` and five `Layout` operations inside that callback, totaling
8.570/9.589/9.764ms. The existing choreography affects exactly the signal-rails
container and its five children: six `scaleX` effects with a 40ms stagger,
260ms duration, `power3.out` easing and `left center` origin.

The shared SiteFooter is composed across routes through the global scene
registry; the attribution traces below exercise its homepage instance. The same
generic `setupSignalScene` also serves `responsible-entry`. Changing
the shared helper would broaden the risk boundary and could alter entry ordering.
The Footer instead needs a sixth concrete adapter over the existing finite
native player and owner.

## Decision

`SCENE_SETUPS.footer` uses a dedicated Footer adapter. `responsible-entry` and
`createSignalSequence` remain unchanged. The adapter supplies only Footer-owned
selectors, cue data, effect namespace and diagnostics; the neutral
`FiniteAnimationPlayer` and `FiniteEntranceOwner` continue to own allocation,
one-clock playback, completion, cancellation, fallback and exact snapshot
restoration.

The native contract is deliberately exact:

- six scoped `[data-motion-signal]` targets and no `[data-motion-copy]` target;
- delays of 0/40/80/120/160/200ms, 260ms duration and 460ms terminal time;
- sampled `power3.out`, `scaleX(0)` to `scaleX(1)`, and `left center` origin;
- effect IDs prefixed with `gorilla-footer`;
- no inline value or priority for `clip-path`, `opacity`, `rotate`, `scale`,
  `transform`, `transform-origin`, `translate` or `visibility`.

Unsupported public Web Animations primitives, a missing or additional signal,
any copy target, or custom inline presentation selects the original scoped GSAP
sequence. The fallback installs completion through GSAP's public
`eventCallback` API. It stops owned work before restoring the exact eight inline
declarations and priorities. Reduced motion and no-JavaScript keep the visible
stylesheet baseline.

## Architecture map

Six feature adapters consume the neutral finite-native infrastructure:

| Consumer      | Feature-owned responsibility                        |
| ------------- | --------------------------------------------------- |
| Reactor       | transition worlds, leases and completion            |
| Material Film | film targets and finite reveal schedule             |
| Manifesto     | editorial target graph and overlap schedule         |
| Terminal      | culture/locator target graph and Full/Lite schedule |
| Service Dock  | FAQ/contact target graph and Full/Lite schedule     |
| Footer        | six-signal contract and 460ms footer-only schedule  |

The neutral core imports none of these selectors or schedules. Effect reuse is
bounded to one player construction batch; no target or effect cache survives an
operation.

## Rejected alternatives

- Change `setupSignalScene` or `createSignalSequence`: this would couple the
  Footer optimization to responsible-entry behavior without evidence.
- Reduce targets, duration or stagger: this changes approved choreography
  instead of removing synchronous GSAP initialization.
- Accept an arbitrary target count: silent markup drift could animate the wrong
  elements and move the terminal time.
- Read computed styles to support custom states: that recreates the measured
  style-resolution cost. Exact inline guards and GSAP fallback are safer.
- Clear transform declarations broadly or after a microtask: cleanup must restore
  exact owned values and priorities without overwriting unrelated state.
- Weaken the 16ms callback gate or delay activation beyond visibility: either
  hides the bottleneck rather than correcting ownership.

## Consequences and acceptance

The frozen entry-document SHA-256 is
`91962ea9f6c37b9fc748b1381c98277edef073f7b923f09108897ecb18b3d2bb`.
The final post-split source/artifact gate passes formatting, lint, 356 strict
files, 462 unit tests, coverage of 96.79% statements, 93.95% branches, 97.42%
functions and 97.67% lines, the 47-page build, artifact checks, the 617-component
SBOM and the high-severity dependency audit.

The controlled matrix passes 12 native/GSAP pairs and 24 captures across
Chrome, Firefox and WebKit, Full/Lite and 390/1440px. It records zero
out-of-budget numeric differences, maximum rect delta 0.067749px, matrix-linear
delta 0.0000646678, zero translation/opacity/clip delta, exact eight-property
inline restoration on both backends in 24/24 captures, natural cleanup in
24/24, equal font metadata and zero application or cleanup errors. This is a
bounded numeric parity matrix, not a screenshot pixel oracle. The authored
duration is 460ms.

Current-artifact CPU×4 traces measure the Footer observer callback at
7.283/4.623/9.104ms, all below 16ms, with zero nested `UpdateLayoutTree`,
`Layout` or forced-style/layout work. This accepts only the bounded Footer
callback. One post-activation y=8000 long frame remains at 59.2ms in run one
with no attributed script; runs two and three record no y=8000 long-animation
frame. This is not proof of universal frame pacing.

The page-wide gate remains failed. Product-area callbacks are
20.844/20.319/19.239ms; Manifesto breaches once at
11.639/18.596/14.325ms; Culture breaches once at
11.579/12.517/16.953ms. FAQ callbacks pass at
12.279/12.106/15.093ms, but their y=6720 long frames remain
170.3/206.3/172.8ms.

The initial combined functional batch passed 35/36 and preserved one Chromium
Full 1440px watchdog timeout after all five entrances and the pause completed.
No application or assertion failure was observed before timeout. A tests-only
split retained the original timeout and assertions, then passed 48/48 in 2.8
minutes with exit 0, no retries or skips: 12 Footer, 12 original four-scene and
24 entry-paint cases. The artifact SHA did not change; this is a harness
scheduling correction, not an application fix. The initial evidence is retained
under `.tmp/footer-functional-before-split-2026-10-25/`, and the passing batch
under `.tmp/footer-functional-split-2026-10-25.log`.

The isolated canonical Lighthouse artifact passes all nine audits with exit 0
and no failures. Its audit entry SHA-256 is
`b4493037596752fe1c2578574e4a93032c98487e7591dbf758ef968217ac97be`;
the local production entry remains the separate unchanged `91962…d2bb` SHA.
Home Performance is 98/98/98 with 2337.84ms median LCP, 37.5ms median TBT and
CLS 0. Product and Find Performance medians are 99, their LCP medians are
2186.76ms and 1959.09ms, and median TBT is 0ms. All other categories are 100 in
all nine audits. Five secondary images retain Low hints with zero promotions in
every home run, and the responsible-entry age text remains LCP.
Evidence is retained in `.tmp/lighthouse-footer-2026-10-25.log`,
`test-results/lighthouse/summary.json` and
`.tmp/lighthouse-footer-image-priority-2026-10-25.json`.

The separately measured FAQ intrinsic-size control is rejected as a production
CSS fix: it does not consistently remove the full-document render tail. No
production CSS changed; the evidence is recorded in
[the FAQ render-tail diagnostic](../quality/FAQ_RENDER_DIAGNOSTIC_2026-10-25.md).

Complete-journey, physical-device, assistive-technology and publication gates
remain independent.
