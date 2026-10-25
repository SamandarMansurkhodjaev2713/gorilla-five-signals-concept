# ADR-0009: Reactor transition presentation ownership

Status: accepted lifecycle design; performance acceptance is independent.
Date: 2026-10-25.

## Context

Every flavor selection previously killed its timeline and manually removed
presentation properties across all five worlds. That discarded authored inline
values and did not reliably invalidate GSAP's normalized transform cache.
Replacing the reset with context reversion lost declaration priorities and
introduced measured synchronous style resolution during rapid input.

## Decision

- One transition owns one nested GSAP context, an exact eight-property inline
  snapshot of its participating incoming/outgoing worlds and two attribute leases.
- Supersession finishes the previous owner before capturing a new baseline.
- Cleanup stops only the owned context through public `kill(false)`, then restores
  declarations and priorities without reading layout. No private cache mutation.
- New timeline tweens use `parseTransform: true` to resolve the current authored
  responsive CSS rather than reuse an obsolete normalized transform baseline.
- A normal selection synchronously holds the incoming world at parent opacity
  zero while keeping the outgoing world visible. After a paint opportunity, GSAP
  installs the complete authored start poses and releases the hold before paint.
- Initial entry has no outgoing world and never hides its only product. It starts
  on one owned frame; subsequent selections use two owned frames.
- Both callbacks validate intent before touching a shared pending-frame handle.
  Scene destruction cancels pending work and finishes the current owner.
- Initialization and cleanup failures do not escape an owned animation callback.
  Independent cleanup operations are all attempted; an injected non-throwing
  infrastructure reporter receives exact failures, including aggregate causes.
- Full/Lite trajectories, duration, easing, stagger and timeline positions remain
  unchanged. Reduced and native no-JavaScript functionality remain available.

## Consequences

Incoming readiness is explicitly owned instead of flashing a final pose before
entrance. Attribute leases restore their previous values, and exact snapshots
preserve authored priorities that GSAP's ordinary style restoration can lose.
Transition helpers do not normalize untouched worlds or initialize their caches.

Native-GSAP browser tests must verify real held paints, exact restoration,
completion, history, keyboard, interruption and Reduced handoff. Mock context
tests cover failure identities and cleanup order, not visual equivalence or FPS.
Native callback traces and complete CPU-throttled journeys remain required;
moving work between callbacks never exempts that work from the measured phase.

See the [five-lens review and rejected prototypes](../quality/REACTOR_TRANSITION_REVIEW_2026-10-25.md).
