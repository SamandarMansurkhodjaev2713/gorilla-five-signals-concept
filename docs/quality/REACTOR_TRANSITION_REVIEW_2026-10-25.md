# Reactor transition ownership and latency review — 2026-10-25

## Scope

Preserve the complete Full/Lite flavor choreography, product truth, selection,
history and no-JavaScript content while removing blanket presentation resets and
making interruption restore exact authored styles. This is not permission to
shorten animations, hide failed performance phases or relax release budgets.

## Five review lenses and unsuccessful iterations

1. **Correctness.** A new real-GSAP contract seeded an authored important opacity
   and compared eight inline declarations and priorities across all five worlds.
   The first context-revert prototype failed all twelve capability/viewport/engine
   combinations: GSAP restored the value but not its priority. The implementation
   now records an exact snapshot of only the two participating worlds.
2. **Ownership and errors.** Each transition owns its nested animation context,
   incoming preparation hold and outgoing visibility lease. Supersession and
   teardown cancel pending frames. Cleanup attempts every independent operation,
   preserves initialization/cleanup causes and notifies the owner even on failure.
   Errors are reported through a non-throwing infrastructure sink, not thrown
   through an outer GSAP callback. Stale callbacks cannot clear a newer frame.
3. **UX and accessibility.** Separating selection mutation from style resolution
   initially exposed a final-pose flash before entrance playback. An incoming
   world-level opacity hold now keeps the outgoing world visible until start poses
   are installed. Initial entry has no hold on its only world. Controls, Reduced
   motion and native no-JavaScript content retain their existing paths. Layout and
   paint containment is limited to the already clipped, transformed stage.
4. **Performance and security.** Native CPU×4 tracing found baseline selection
   preparation callbacks of 38.100/60.376/67.838ms. A context-revert prototype made
   input callbacks worse, including 125.626ms with ten style updates totaling
   89.011ms. That cleanup strategy was rejected. The current owner stops only its
   context with public `kill(false)` and restores the snapshot without layout
   reads. New tweens explicitly use `parseTransform: true` so responsive authored
   CSS is reparsed rather than reusing stale normalized GSAP cache values. No
   private GSAP cache fields, new dependencies, assets or data collection.
5. **Maintainability and release.** Lifecycle ownership is separate from authored
   choreography and presentation snapshots. Existing durations, eases, stagger,
   trajectory and timeline positions remain intact. Real-browser restoration,
   continuity and functional checks must pass independently of fake-context unit
   tests. Native callback attribution and canonical journey/Lighthouse budgets
   remain distinct requirements; successful cleanup is not a frame-rate pass.

## Private retained diagnostics

- `.tmp/cold-native-baseline-2026-10-25/`: pre-change native attribution and geometry.
- `.tmp/cold-native-containment-2026-10-25/`: containment-only exploratory trace;
  selection callbacks still reached 56.079ms, so containment was not a cure.
- `.tmp/cold-native-owned-transition-2026-10-25/`: rejected context-revert trace.
- `.tmp/reactor-owned-initial-browser-2026-10-25.log`: all twelve failed priority
  contracts, retained rather than weakened.
- `.tmp/quality-reactor-snapshot-2026-10-25.log`: initial strict-check failure in
  test mock callable types, requiring correctly typed mocks rather than casts.

These diagnostics are local and excluded from Git. Main/Pages remains held and
the review PR remains draft. This record does not establish release acceptance.

## Targeted native attribution after snapshot ownership

Three fresh installed-Chrome 155 contexts with acknowledged CPU×4 and measured
hardware compositing recorded maximum selection click callbacks of
**16.104 / 13.296 / 14.753ms**. Runtime preparation callbacks still reached
**41.859 / 31.190 / 59.240ms**; these do **not** satisfy the 16ms frame-work gate.
These captures attribute native input and preparation callbacks. Their original
960ms tail did not include the entire delayed shard sequence, so they must not
be read as complete-choreography acceptance. They are diagnostic callback
durations, not INP, FPS, or full canonical journey acceptance.
Raw traces, browser/GPU metadata, geometry and document hashes are retained in
`.tmp/cold-native-snapshot-transition-2026-10-25/`.

The stronger twelve-case browser batch passed initial entry and the four real
flavor completion/held-paint transitions, then failed exact restoration after
native history. Independent node-identity evidence established a separate cause:
Astro replaced the entire Reactor root on each product back/forward navigation,
disconnecting the original fixture and resetting scroll to zero. The local record
`.tmp/reactor-history-diagnostic-2026-10-25.json` contains the original disconnected
node, actual before/after-swap/page-load events and unchanged Full capability.
This failure is not a reason to weaken the exact presentation assertions or
reseed a mutated existing node. Product-history ownership requires correction.

## Corrected history integration and source verification

Product history now uses a validated versioned namespace, preserving all existing
framework metadata. An early self-hosted native-event bridge plus the controller's
owned subscription consumes only owned, allowlisted, same-path traversals; actual
route, initial and foreign history remain Astro-owned. No private router fields
are synthesized or mutated. See
[ADR-0010](../decisions/ADR-0010-product-history-route-boundary.md).

The initial late-capture strategy passed ten Firefox/WebKit scenarios but failed
all five Chromium scenarios. A native Window-target ordering diagnostic proved
that Chromium invoked the earlier non-capture listener before a later capture
listener. The fix is explicit parser-time registration before deferred router
modules, not an assumption that capture changes Window target ordering. Retained
batch: `.tmp/reactor-history-final-browser-2026-10-25.log`.

Before the early-bootstrap revision, the complete `quality:pages` source/artifact
gate passed against the combined candidate: 294 strict files, zero diagnostics,
307 unit tests, 47-page production
build, artifact/font/content/provenance/SBOM checks and zero known candidate
dependency vulnerabilities. Log:
`.tmp/quality-reactor-history-complete-2026-10-25.log`.
Source review independently found no remaining correctness, ownership,
start-pose or error-cleanup blocker. Browser and performance evidence remain
separate from that source-level conclusion.

## Observation-window correction

Review of actual implicit timeline appends established a 2256ms Full Reactor
duration, not a sub-second entrance. The performance tail was therefore increased
from 960ms to 2500ms. The new timing test executes the real factories for all five
flavors, verifies the exact authored call sequence and proves the tail includes
their maximum plus two frame-work margins. CPU×4, three sessions and hard
16/50/200ms limits are unchanged. Earlier short-tail evidence is retained but is
not complete-window acceptance.

Final source gate after this correction passes 296 strict files, the additional
strict classic-bootstrap check, 315 units, production build, artifact checks and
audit. Log: `.tmp/quality-reactor-observation-window-2026-10-25.log`.
The application HTML is unchanged by the test correction, SHA-256:
`4d4ac8311668f5431af4564c7d90396ce9e18327d54b9365472e39c3446cef2f`.

The early-bridge browser batch passes 57 executed cases without retries:
15 new cross-engine ownership/history cases plus 42 existing Chromium geometry,
semantics, touch, keyboard, interruption, Reduced and no-JS cases. The 84 existing
non-Chromium exclusions belong to the older Chromium-only contract file; none
was added or converted from a failure. Log:
`.tmp/reactor-bridge-cross-engine-2026-10-25.log`.

The next measured structural experiment is specified in the
[native-player plan](../motion/REACTOR_NATIVE_PLAYER_PLAN.md). It is not an already
implemented feature or a substitute for the remaining release gates.

## Complete-window canonical result: failed, no waiver

Three sessions completed with the unchanged CPU×4 profile, 16ms frame work,
50ms long task and 200ms interaction limits. Rendering metadata explicitly
records Chromium 151 / Windows / SwiftShader software compositing; this is not
described as physical-device or hardware-GPU acceptance.

Maximum observed application work inside Long Animation Frames, milliseconds:

| Phase | Run 1 | Run 2 | Run 3 |
| --- | ---: | ---: | ---: |
| Confirmation/startup | 33.4 | 28.2 | 57.0 |
| Cold scroll | 33.2 | 59.9 | 24.3 |
| Product selection | 17.5 | 23.1 | 1.7 |

Startup long tasks reached 63/none/65ms. Selection recorded no long tasks over
the reporting threshold and Event Timing maxima of 128/152/112ms. Passing those
interaction samples does not waive frame-work failures or establish field INP.
LoAF attribution is also not a substitute for direct per-callback tracing.

All fifteen phase JSON payloads and three rendering/artifact metadata payloads
are retained in the HTML report's embedded ZIP, alongside the trace. Log:
`.tmp/reactor-full-window-performance-2026-10-25.log`; report:
`.tmp/reactor-full-window-performance-report-2026-10-25/index.html`.
The 960ms report remains separate and cannot be substituted for this result.

## Bounded visual inspection

Native Chrome viewport captures at 390×844 and 1440×900 were inspected after
2500ms, preserving the existing composition and readable product/actions. This
does not establish all-route, all-scroll-position or physical-device acceptance.
Images: `.tmp/reactor-final-viewport-visual-2026-10-25/`.

An element-clipped capture appeared to include an offscreen fixed skip link.
Actual native geometry showed it above the viewport (bottom −20px), not focused,
and the viewport capture confirmed it hidden. No accessibility control was
removed and no production CSS was changed to compensate for that capture artifact.
