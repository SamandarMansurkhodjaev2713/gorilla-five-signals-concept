# Browser measurement context — 2026-10-25

## Verified environment, not an inferred cause

The installed Playwright 1.62.0 implementation adds
`--disable-accelerated-compositing` to Windows WebKit's default launch arguments
when the WSL channel is not used. An independently owned WebKit 26.5 process
confirmed the flag in its actual spawn arguments alongside `--headless` and
`--no-startup-window`. No launch defaults were removed or overridden.

Installed `playwright-core/lib/coreBundle.js` SHA-256:
`3258d1cf334c6afc95f22aa9c292436cb976b391e0437f1359c83b84f0cb9d66`.
The relevant installed source is at lines 50607–50608. The actual-process report
is retained privately in `.tmp/browser-rendering-environment-2026-10-25.json`.

A separate owned Chrome 155.0.8059.85 process launched through the existing
Lighthouse helper reported `gpu_compositing: enabled` and Intel ANGLE/D3D11.
This fresh metadata does not prove the renderer state or exact native operation
inside any earlier failed Lighthouse trace. Those numerical failures remain
open; they cannot be discarded as a Windows WebKit limitation.

## Interpretation correction

Historical Windows WebKit frame timings are real observations of its software
compositing path. They are not measurements of hardware-accelerated Safari or a
physical iPhone. Functional failures, delayed playback and sparse sampling are
not waived, and the application is not automatically accepted on another
platform. The native-entry experiment still lacks demonstrated benefit and
complete lifecycle coverage; no engine replacement is shipped.

Playwright's own [browser guidance](https://playwright.dev/docs/browsers#webkit)
distinguishes its WebKit build from branded Safari and identifies macOS as the
closer platform. Physical-device performance and endurance remain separate
release requirements. Do not remove default flags or downgrade Full motion to
manufacture a passing result.

## CPU profile correction

The committed motion-journey test requested CPU rate **1**, while the strategy
and release checklist require **4**. Source history contains no authorizing
exception. Earlier documentation claiming three ×4 sessions is unverified
without independently bound artifacts; it is not current release evidence.
Lighthouse's own CPU simulation settings are separate and unchanged.

The journey now consumes one frozen profile: three sessions at requested CPU
×4, 16ms application/LoAF-blocking limit, 50ms long-task limit and 200ms
interaction limit. A unit contract guards these exact settings.

Each session attaches validated OS/browser/GPU metadata, the requested rate and
successful throttle-command acknowledgment, viewport/DPR and the actual served
homepage digest checked against the build. A protocol acknowledgment is not an
independent measurement of the physical slowdown factor. GPU metadata records
the observed state rather than granting hardware eligibility. Missing metadata
fails closed; an observed disabled compositor is not silently called hardware.

The metadata request has a deadline; its session detaches on success, malformed
data, protocol rejection and timeout. Combined read/cleanup failures retain both
errors, including non-Error rejections. The complete browser context is now
owned before page/setup work begins, so setup failures also close it. Only
rendering fields are captured, not debugger tokens, user profiles or PII.

## Verification and remaining gate

The first corrected-profile attempt stopped before browser execution: Astro 7
automatically backgrounded preview when it detected an agent. Both Playwright
servers now use the supported `--ignore-lock` option, keeping the supervised
server in the foreground without replacing the separate user preview lock.
A unit contract guards this configuration. No browser thresholds changed.

The subsequent formal attempt completed all three sessions and failed the
existing performance assertions. Run 1 startup recorded a 67ms long task,
63.2ms application-frame work and 20ms LoAF blocking against 50/16/16ms limits.
Run 3 product selection recorded 48.1ms application-frame work and 41.7ms
blocking. These are retained failures, not accepted performance.

All three environment attachments agree: Playwright Chromium 151.0.7922.34,
Windows, `gpuCompositing: disabled_software`, ANGLE Vulkan/SwiftShader,
1440×900 at DPR 1, requested CPU rate 4 with successful command acknowledgment.
The served homepage matched the built artifact, SHA-256
`684d4fe1f4e5eacdb920a361c491dbea35e586f40fbc730b3b40b4b3793e0112`.
This is a software-rendered stress profile, not the separately observed
hardware-composited Chrome 155 Lighthouse environment or physical Safari.
Do not compare those environments as interchangeable results.

Raw attachments and trace remain private under
`.tmp/performance-cpu4-profile-foreground-2026-10-25/`. The owned port 4322
server closed after the failed test; the separate port 4321 preview remained
running. Source-quality checks are reported separately from performance.

Final `quality:pages` passes: formatting/lint, strict diagnostics on 260 files
without errors/warnings/hints, 190 unit tests, 47-page production build,
artifact/font/provenance/SBOM checks and dependency audit (zero known findings).
This is not a motion-performance pass. The private source-check transcript is
`.tmp/quality-measurement-context-2026-10-25.log`.

## Five review lenses

1. Correctness: distinguish actual launch/GPU evidence from inference; restore
   the declared CPU multiplier and preserve threshold values exactly.
2. Architecture: share the immutable profile; isolate validated protocol access
   and bounded lifecycle cleanup in test-only helpers. No application change.
3. UX/accessibility: preserve Full/Lite/Reduced and all functional cross-engine
   tests. Do not trade missing visual motion for faster completion.
4. Performance/security: retain raw failures and record rendering context before
   measurement; keep diagnostic data private and do not collect profile data.
5. Maintainability/release: qualify historical ×4/Safari claims, test failure
   combinations and bind new results to the served artifact. Physical-device,
   current Lighthouse and full release acceptance remain unproven.
