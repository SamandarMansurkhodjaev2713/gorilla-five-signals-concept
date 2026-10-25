# ADR-0013: Adaptive native home entrances

Status: implementation candidate; final runtime and release gates remain open.
Date: 2026-10-25.

## Context

ADR-0012 introduced a feature-neutral finite Web Animations player for Reactor
and Material Film. Hardware CPU×4 traces then attributed the remaining cold
Manifesto and Tashkent Terminal spikes to GSAP effect construction rather than
to their authored timelines. Moving those same finite entrances to the shared
owner removed their style and geometry reads, but exposed two independent costs:

- the original 65-stop sampled `linear()` curves were not precise enough for a
  3840px clip trajectory;
- a uniform 513-stop correction preserved the trajectory but repeatedly parsed
  the same large keyframe/easing payload for sibling effects.

The uniform candidate was rejected after hardware CPU×4 callbacks measured
17.399/19.194/16.481ms for Manifesto, 16.548/15.672/12.234ms for Material Film
and 23.309/20.412/24.595ms for Tashkent Terminal. Nested style-tree updates and
layouts were already zero, so moving the work or weakening the 16ms gate would
not address the constructor/parser cost.

## Decision

Manifesto, Material Film and Tashkent Terminal use explicit native cue plans for
Full and Lite. Their existing shared finite entrance owner retains exact inline
snapshots, one scoped GSAP fallback context, deterministic cancellation and
non-throwing diagnostics. Reduced motion and no-JS continue to use the visible
CSS baseline. Timing, target order and authored effects are unchanged.

Native easing strings are generated once from the installed choreography
functions with bounded adaptive subdivision. Each segment is tested at three
interior probes against a maximum normalized error of `0.00004`; generation is
also bounded to depth 12 and 513 total stops. The resulting enter, material and
snap curves contain 137, 159 and 145 stops respectively. The dense 3840px clip
check remains below the unchanged 0.25px tolerance without paying the uniform
513-stop cost for every curve.

Within one `constructEffects()` operation, the finite player reuses the first
compatible public `KeyframeEffect` as a copy-constructor source. A clone receives
its own target and delay before `Animation` allocation; duration, easing, frames,
fill and the document-clock origin remain identical. The cache is local to that
single construction pass. It is never retained across scenes, route lifetimes,
windows or realms.

Reuse is fail-closed. A cue receives a key only when every keyframe is a plain
object containing enumerable string-keyed data properties with primitive,
finite values. Accessors, symbols, non-enumerable properties, non-plain
prototypes, nested values and non-finite numbers bypass reuse and go directly
to the original browser constructor. That constructor remains the validation
authority. Capability detection verifies the public copy constructor, mutable
target and isolated `updateTiming()` behavior; a known unsupported `TypeError`
selects GSAP, while an unexpected error is surfaced.

The Tashkent Terminal heading uses `text-wrap: wrap`. A controlled WebKit test
showed that `balance` could recalculate its line breaks when the clip entrance
released, changing the whole section geometry even though both animation paths
were otherwise equivalent. `wrap` keeps the approved words, responsive sizing
and line layout stable through natural cleanup.

## Rejected alternatives

- Keep uniform 513-stop curves: visually precise, but measured over the frame
  budget in multiple callbacks.
- Reduce targets, shorten durations or simplify the choreography: changes the
  approved Full/Lite experience instead of removing redundant setup work.
- Cache effects across operations or on `window`: retains targets and realm
  objects beyond their owner and makes route cleanup non-local.
- Keep separate template effects: adds allocations; the first live effect is a
  sufficient copy source.
- Read computed styles to normalize targets: reintroduces the layout-sensitive
  preparation that the native path is designed to avoid.
- Delay initialization, hide content or move the callback outside measurement:
  conceals the cost and violates entry/readiness ownership.

## Consequences and acceptance

The current artifact SHA-256 is
`577dd60a1cd70b3a56c84d003b2a892019eb5d5fdfc5e87389f079de7840434b`.
Source/artifact verification passes 335 strict files and 435 unit tests, along
with build, budgets, provenance, fonts, SBOM, license and high-severity advisory
checks. Focused tests cover effect-copy isolation, duplicate/unique plans,
partial construction rollback, unsupported capability, non-finite values and
accessor bypass without evaluating getters in the reuse key.

Adaptive pre-reuse hardware evidence brings Manifesto and Material below 16ms
in all three runs; Terminal records 10.909/20.806/14.304ms, so that candidate is
not accepted. The following copy-reuse artifact records
17.801/13.098/21.664ms for Manifesto, 6.530/5.967/5.659ms for Material and
7.952/13.064/4.176ms for Terminal. All nine target callbacks contain zero nested
style-tree updates and layouts, but Manifesto fails two runs. The uneven
cross-run change does not establish copy reuse as the cause of an improvement.

That trace also predates the final fail-closed key correction. Every production
cue was reusable, so it remains relevant diagnostic evidence, but it is not
current-hash acceptance. Three still-unattributed Product/Store/Contact boundary
callbacks also reach 27.819/14.747/18.704ms, 35.900/29.193/6.651ms and
45.679/11.557/18.882ms; those labels do not establish exact feature ownership.

The final current-hash controlled parity matrix passes 24 scene comparisons
(12 matched backend pairs × two scenes) and 48 scene/backend captures across
Chromium, Firefox and WebKit, Full/Lite and 390/1440px, with zero differences.
Natural cleanup passes 48/48 and exact eight-declaration
inline restoration passes 24/24. Maximum deltas are 0.0167px rect, 0.000073
opacity, 0.00004 matrix linear, 0.000782px matrix translation and 0.054px clip,
within the unchanged bounds. This is controlled parity and cleanup evidence,
not native input, FPS or performance acceptance. A separate current-hash
functional batch passes 27 cases without retries/skips: 12 home entrances,
12 Reactor cleanup cases and three product/route history cases. Passing does
not erase the earlier intermittent fallback failure. Lighthouse, complete-journey,
physical-device, assistive-technology and legal release gates remain open. This
ADR does not authorize publication.
