# Reactor native-player experiment

Status: implemented local candidate; not approved for main/Pages publication.

## Objective

Remove repeated GSAP CSS style-resolution work without reducing the authored
Full/Lite experience. Keep the verified transition ownership, visibility holds,
exact inline restoration, native history and existing release budgets.

The candidate selects the native player only after capability and presentation
guards; GSAP remains its unsupported-presentation fallback. Public main/Pages
still use the previous implementation. A passing capability probe or controlled
pose comparison does not authorize publication: real interruption, resource,
complete-window performance and release gates remain mandatory.

## Authoritative schedule

Derived from the current choreography factories and verified by
`flavor-reactor-timing.spec.ts` across all five flavors. Times are milliseconds.

| Role | Full start–end | Lite start–end |
| --- | --- | --- |
| Outgoing product | 0–260 | 0–260 |
| Outgoing copy | 120–280 | 120–280 |
| Outgoing material | 0–260 | absent |
| Incoming material | 0–640 | absent |
| Incoming product | 0–880 | 280–540 with outgoing; 0–260 otherwise |
| Incoming copy | 120–760 | 120–380 |
| Incoming word | 160–800 | absent |
| Orbit 1 / 2 | 640–1520 / 672–1552 | absent |
| Shard 1 / 2 / 3 | 1552–2192 / 1584–2224 / 1616–2256 | absent |

Do not flatten the implicit orbit/shard appends into simultaneous entrances.
The performance observation tail is 2500ms; the obsolete 960ms tail did not
cover the complete Full sequence. Hard 16/50/200ms budgets remain unchanged.

## Implementation sequence

1. Capture current start/milestone/end visual baselines for all five flavors at
   phone and desktop sizes before changing the backend. Preserve the real
   interruption, important-style and cross-route history contracts.
2. Introduce immutable typed role/cue plans. Read scoped element references,
   computed property strings and geometry into plain values before creating any
   effects. Never retain a live `CSSStyleDeclaration` or read layout after writes.
3. Build a tested 2D-matrix decomposition/serialization utility matching the
   installed GSAP component order. Preserve unspecified translation, skew,
   rotation and scales; override only the components currently authored. Keep
   percentage translation as percentage translation. Reject unsupported or
   non-finite matrices rather than approximate silently.
4. Generate reusable native easing curves from the actual installed GSAP ease
   definitions. Quantify sampling error; do not substitute generic bezier curves.
   Verify CSS easing support and real WAAPI parsing in all three engines.
5. Replace only the presentation player behind `ReactorTransition`. Own every
   `Animation`, its finish listener and cancellation. Construct effects idle, use
   one shared timeline origin and `fill: both`, then release the preparing hold
   after all start poses exist. Never call `commitStyles`.
6. On completion, supersession, failure and teardown, cancel every effect, clear
   listeners/references, then run the existing exact snapshot/attribute cleanup.
   Preserve aggregate causes and non-throwing failure reporting.

## Acceptance and rejection

- All existing ownership, important-priority, Reduced, keyboard, rapid-input and
  native history cases remain green. Explicitly verify the native backend itself,
  not only a silently selected fallback.
- Probe milestone parity at 0, 120, 280, 640, 800, 1552, 1900 and 2256ms. Quantify both
  matrix and opacity differences; reject visible jumps or unapproved trajectory
  changes. Test important declarations and native animation cascade interaction.
- Native CPU×4 traces must show batched style reads, no read after the first
  effect write and callbacks below the unchanged 16ms budget in three fresh runs.
  Keep the canonical complete-window journey and hardware diagnostic separate.
- No Reactor effects remain in `document.getAnimations({subtree:true})` after
  completion/destroy. Repeated supersession must not retain growing collections
  of transitions, animations, effects or GSAP contexts. Use a dedicated memory
  run, not forced GC inside a performance measurement.
- Unsupported easing, matrix, cancellation or shared-clock behavior keeps the
  verified GSAP path. Any failed parity/performance requirement rejects default
  activation and requires a measured correction, not a weaker test.

The native player remains a measured candidate. It does not waive startup,
Lighthouse, responsive, accessibility, physical-device or publication gates.

## Local implementation evidence — 2026-10-25

The typed cue plan preserves the complete 2256ms Full choreography and the
540/380ms Lite variants. A pure 2D transform reader/serializer preserves the
installed GSAP component order; unsupported transforms, important declarations,
independent transform properties or word clips select fallback rather than an
approximation. Sampled CSS `linear()` easings are tested against installed GSAP
curves. Effects are constructed idle after all reads, share one document clock,
and cancel without `commitStyles` through the existing exact-snapshot owner.

Controlled Chrome, Firefox and WebKit comparisons each cover 40 paired cases
(five flavors × Full/Lite × phone/desktop × initial/outgoing) and eight milestones:
640 backend samples and 80 completed cleanup states per engine. Rect differences
stay below 0.334px, opacity below 0.000072 and transform translation below 0.061px.
Firefox's raw clip-string precision differences are retained; a separate strict
finite inset-edge comparison bounds their actual pixel difference below 0.000012px.
This controlled seeking/finishing evidence is not natural completion, native
input, frame-time or physical-device acceptance.

The frozen baseline exposed a real GSAP copy bug: percentage translation was
also retained as pixel translation, causing a cleanup jump. The fallback now
explicitly sets copy `x: 0` at both endpoints. Parity compares this corrected
baseline; the original capture is retained, not silently redefined.

The first natural browser batch passed 56 cases but failed WebKit Lite desktop
cleanup after rapid keyboard/history changes. Seven isolated diagnostic repeats
passed without a production change; they do not resolve the original failure.
The intermittent completion issue, Lighthouse and publication remain open.
The separate 1000-event synthetic resource stress passes owned-effect/lease
bounds and cleanup, with stable player counts at three GC checkpoints; total
heap growth is retained in the review rather than described as zero. The new
three-session complete-window CPU×4 journey still fails its unchanged limits.
See the [five-lens review and raw evidence locations](../quality/REACTOR_NATIVE_PLAYER_REVIEW_2026-10-25.md).
The user explicitly selected publication only after the outstanding problems
are fixed; no main/Pages update is authorized by these partial results.
