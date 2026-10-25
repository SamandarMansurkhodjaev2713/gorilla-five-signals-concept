# ADR-0008: Owned, cancellable scene preparation

Status: accepted architecture; performance acceptance remains separate.
Date: 2026-10-25.

## Context

Full Hero initialization performed substantial synchronous GSAP work inside a
single callback. Moving this work after a ready event would hide the cost rather
than fix it. Preparing paused `from` animations across frames also risks exposing
their immediate-render start poses before the presentation can actually play.

## Decision

- A scene may register a finite sequence of synchronous preparation stages.
  Exactly one stage executes per requested animation frame. Registration closes
  when synchronous scene setup returns.
- Scene handles are registered before awaiting their `ready` promise. The owning
  environment can therefore destroy a partially prepared scene immediately.
- A scene remains mounting until preparation finishes. Aborted handles remain
  destroyed; late callbacks cannot reactivate them.
- Full Hero prepares one target per stage. Original stagger and overlap times
  are expressed as absolute timeline positions, preserving authored choreography.
- Each preparation transaction captures the original inline pose, initializes
  the new tween with callbacks suppressed, records its starting pose, and restores
  the original pose before paint. The final stage applies starting poses and plays
  the timeline. Native content and controls remain available during preparation.
- Teardown invalidates only touched transform caches, then restores all owned
  inline declarations and priorities. Cancellation must not initialize untouched
  presentation elements merely to clean them up.
- Immediate-scene failures reject activation and select the readable Reduced
  fallback. They cannot publish a successful Full-ready event. Deferred failures
  after successful startup remain isolated and reported.
- Generation identity prevents an obsolete rejected build from replacing a newer
  environment, including rebuilds with the same capability.

## Consequences and verification

Preparation uses additional frames, without artificial loading counters or a
content barrier. Existing Lite choreography and Reduced content are retained.
Lifecycle tests cover cancellation, thrown values, ownership and cleanup. Real
GSAP browser tests must additionally verify unchanged preparation poses and exact
restoration; fake timelines alone cannot establish those properties.

Direct native callback tracing supplements Long Animation Frame evidence: an
individual callback can exceed the 16ms application-work budget without producing
a long frame. Neither successful activation nor an absence of LoAF entries is a
performance pass. CPU-throttled startup, scrolling, selection, mobile visual QA
and Lighthouse remain independent release gates.
