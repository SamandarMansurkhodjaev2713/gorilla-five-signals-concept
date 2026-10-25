# ADR-0011: Native Reactor presentation behind the transition owner

Status: local candidate; release acceptance incomplete.
Date: 2026-10-25.

## Context

CPU×4 attribution identified repeated GSAP CSS transform/style resolution in
finite Reactor presentation. Removing the authored orbit/shard sequence or
shortening its observation window would hide the problem, not solve it.
The exact transition snapshot, visibility lease and history contracts from
ADRs 0009/0010 must remain independent of the presentation backend.

## Decision

- Keep `ReactorTransition` as the lifecycle owner. Its presentation is a typed
  native-player/GSAP-context union; completion, interruption, failure and teardown
  use the same exact declaration/priority and attribute restoration transaction.
- Separate pure transform math, sampled easing, cue planning and frame generation
  from the scoped DOM read boundary and native effect owner. No new dependency,
  environment variable, global animation selector or global GSAP policy is added.
- Read all target geometry and computed presentation before constructing effects.
  Retain plain values, not live computed-style objects. Preserve unspecified 2D
  transform components in the installed GSAP order, including percentage anchors.
- Generate CSS `linear()` stops from the installed ease definitions with measured
  error bounds. Preserve the complete Full 2256ms and Lite 540/380ms schedules,
  including implicit appended orbit/shard entrances. Reuse shared timing tokens.
- Probe API presence, CSS support and actual keyframe easing parsing per window.
  Unsupported 3D/singular transforms, important inline declarations, independent
  transforms, hidden inherited presentation, custom word clips or unexpected role
  counts select GSAP. Unexpected exceptions are reported, not swallowed as support
  failures.
- Construct native effects idle, then play them with one finite document-timeline
  origin and `fill: both`. A finish listener on the terminal effect completes the
  group. Abort listeners and cancel every owned effect on every exit; never use
  `commitStyles`, global kills or private GSAP cache mutation.
- Reject non-finite/non-positive cue timings before allocation. Partial setup
  failure cancels constructed effects and preserves setup/cleanup causes.

The native API model follows the
[W3C Web Animations specification](https://www.w3.org/TR/web-animations-1/).
Browser behavior is verified separately rather than inferred from API presence.

## Baseline correction

Frozen GSAP pose captures exposed double translation in Full incoming copy:
`parseTransform` retained a resolved pixel displacement alongside `xPercent`.
Copy now explicitly authors `x: 0` at both endpoints. This removes a final cleanup
jump and is covered for all five flavors. Native parity uses the corrected GSAP
fallback; raw old-baseline evidence remains available privately.

## Consequences and rejection gates

The pure cue table is intentionally cohesive despite exceeding 200 physical
lines; it contains no effects, mutable registry or per-flavor duplicated factory.
Splitting it into one-file-per-role would obscure the schedule being verified.
The normal renderer remains unchanged: this is a presentation optimization, not
a redesign or reduced-motion replacement.

Controlled pose comparison is not natural completion, user-input, memory or
frame-performance acceptance. The first natural batch found an intermittent
WebKit/GSAP-fallback completion timeout after rapid history traversal; isolated
repeats passing do not erase that failure. Resource stress, complete-window CPU×4,
Lighthouse and physical-device acceptance remain independent release gates.

Main/Pages stay unchanged under the user's explicit instruction to publish only
after the outstanding smoothness and performance problems are fixed. A failed
gate requires correction, not looser thresholds, shortened choreography or an
unrecorded production switch. See the
[implementation evidence and remaining gates](../motion/REACTOR_NATIVE_PLAYER_PLAN.md).
