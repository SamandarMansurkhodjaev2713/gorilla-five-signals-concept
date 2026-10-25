# Hero presentation ownership — 2026-10-25

## Confirmed defect and user outcome

An owned-browser check on `d0d0d2a` found that selecting Reduced after Full left
the orbit and primary can with generated inline transforms. The orbit retained
`translate(-50%, -50%) translate(0px, 0.203px)` plus independent transforms set to
`none`. The can retained a computed pixel matrix rather than returning fully
to its responsive stylesheet declarations. This is presentation residue, not
proof that every viewport was visibly broken.

GSAP quick setters normalize CSS transforms without establishing a complete
style transaction themselves. The Hero's entry/pointer work now shares a
scoped presentation context with a snapshot of eight owned declarations on
its existing targets. Its returned cleanup runs after tween reversion,
invalidates normalized transform caches through public `clearProps`, then
restores exact original values and priorities. `ignore` prevents that immediate
cache-clearing operation from joining a context being destroyed. Unrelated
declarations are not replaced; no entire `style` attribute is overwritten.

The source keeps all entry poses, timings, eases, CSS exit choreography, pointer
depth, imagery, copy and responsive composition. This is a lifecycle correction,
not adoption of the rejected native animation prototype or a frame-rate claim.

## Exceptional setup rollback

Review found that the original scene wrapper assigned its GSAP context only
after setup returned. A thrown setup callback therefore escaped GSAP's own
ambient-context restoration and left the partial context unassigned during
rollback. The wrapper now catches a discriminated failure outcome inside that
callback, lets GSAP return normally, assigns the context, and only then routes
the original cause through the existing emergency cleanup. Falsy thrown values
remain distinguishable from success.

Hero readiness cleanup and its post-revert restoration are registered before
animation/pointer initialization, not after successful completion. A failed
setup therefore removes the ready marker, stops partial owned work and restores
the original presentation rather than leaving CSS motion enabled.

## Startup attribution boundary

A separate three-session diagnostic on the preceding artifact captured native
LoAF script attribution at requested CPU ×4 in Chromium 151/SwiftShader software.
The shared immediate-scene frame callback consumed 73.4/45.5/44.9ms, including
24.0/15.4/13.7ms forced style/layout. Its emitted character position maps to the
frame-promise continuation used by immediate scene mounting; this does not
identify every internal Hero call separately. Initial ClientRouter module
evaluation also recorded 287.6/174.0/164.5ms forced layout before confirmation.
Those initial-load costs are separate from the confirmation-startup gate.

Raw attribution is private in `.tmp/home-startup-attribution-2026-10-25/`.
Do not prewarm with `getProperty` as if it were read-only: installed CSSPlugin
normalizes independent transforms during that call. Do not simply reorder
scroll-exit activation without checking restored scroll and additive poses.
The existing failed ×4 and Lighthouse gates are not waived by this cleanup.

A further bounded diagnostic on the current artifact used installed Chrome
155.0.8059.85. It reported enabled GPU compositing with Intel ANGLE/D3D11,
1440×900/DPR 1 and acknowledged requested CPU ×4. Its served homepage matched
the build, SHA-256
`e131922da7dbe82b7e98a9e6c72e7b9e8b36b32f528286357bf514dd98d80fcd`.
Initial ClientRouter forced layout still measured 228.1/217.3/224.8ms. The
shared scene callback appeared among retained slow frames in sessions 2/3 at
96.9/49.1ms script duration, including 28.8/13.4ms forced layout. Its absence
from session 1's four largest retained frames is not evidence of zero work.

Thus remaining startup delay is not exclusively a software-compositor artifact.
These are diagnostic observations, not a canonical Lighthouse run, a complete
journey gate, or an apples-to-apples speedup comparison with the preceding
software-rendered artifact. Preserve them separately in
`.tmp/home-startup-installed-chrome-2026-10-25/`; all owned browsers closed.

## Five review lenses

1. Correctness/edge cases: snapshot absent declarations, exact priorities,
   multiple targets and repeat restoration. Exercise normal capability cycles
   and failed initialization, including non-Error setup causes.
2. Architecture/lifecycle: retain scene-owned listeners/frames; restore styles
   after GSAP reversion, not before it. Register rollback before operations that
   can fail. Do not access private GSAP caches or globally kill animations.
3. UX/accessibility: preserve Full/Lite/Reduced, native menu activation, content
   and desktop/mobile composition. Test entry interruption, repeated pause,
   resize and usability after an injected partial setup failure.
4. Performance/security: no new dependencies, external requests or telemetry.
   Snapshot only inline declarations, without synchronous geometry reads.
   This adds bounded lifecycle work; it is not a measured performance win.
5. Maintainability/release: a small typed DOM adapter isolates declaration
   capture. Unit tests use a style factory; browser tests use the actual entry,
   controls and source target families. Keep source, browser and performance
   acceptance distinct; physical-device and public-release gates remain open.

## Verified scope

- Final `quality:pages` passes: 264 strict-checked files, 197 unit tests,
  47-page build, formatting/lint, artifact/font/provenance/SBOM validation and
  dependency audit with no known findings. Transcript:
  `.tmp/quality-hero-rollback-verified-2026-10-25.log`.
- The 12 normal Hero lifecycle cases pass across Chromium, Firefox and WebKit:
  Full/Lite at 390/1440px, two capability cycles, exact original declarations
  after entry interruption, and resizing to the other viewport and back.
- Three real-browser failure-injection cases pass, including an original
  `!important` declaration, removed readiness marker and usable menu after a
  partial Hero setup failure. Native event registration is restored before
  the injected exception, not left patched for subsequent interactions.
- All six existing mouse/touch menu activation checks also pass. Total:
  **21 passed**, one worker, no retries. Evidence is retained privately in
  `.tmp/hero-rollback-verified-2026-10-25/` and its matching `.log`.

This is scoped functional evidence, not a full-browser-matrix, physical Safari,
Lighthouse or 16ms frame-budget pass. No new canonical performance acceptance
is claimed for this artifact.
