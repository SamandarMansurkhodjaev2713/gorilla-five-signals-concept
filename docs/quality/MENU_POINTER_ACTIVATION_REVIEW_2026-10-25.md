# Menu pointer activation — 2026-10-25

## Confirmed user-facing defect

The post-switch interruption check reached the expected single product and
cleared its departure marker, but its real pause click left the preference at
`system` and motion at `full`. The independent owned-browser diagnostic logged
the actual click target as the surrounding settings `fieldset`, not the pause
button. No preference event or storage update occurred.

The menu entrance translates its interactive groups by 24px. Its old
`pointerdown → settle` handler immediately cleared that translation. Focus
handling could also clear it between press and release. Moving the pressed
button underneath the pointer changes the native activation target; this is a
functional input defect, not a reason to force-click or enlarge a test timeout.

## Correction

Pause the entrance timeline during a pointer press without changing its current
presentation. Do not snap the focused group while a press or post-release
activation frame is outstanding. After pointerup/cancel, an owned animation
frame clears presentation; a new press cancels that pending settlement first.
Document-level release listeners handle releasing outside the menu. Keyboard
focus outside a pointer activation still settles immediately. Close, runtime
replacement and teardown retain the existing synchronous normalization.

No trajectory, opacity, duration, easing, navigation target or motion preference
is removed. No synthetic click, forwarded activation, input delay, permanent
`pointer-events` suppression or test timeout change is introduced.

An intermediate implementation passed five of six mouse/touch browser checks
but failed Chromium touch. Review identified the remaining compatibility-focus
and queued-frame/new-press windows; both are now guarded. Retain that failed
batch under `.tmp/menu-pointer-activation-2026-10-25/` rather than reporting it
as a complete pass.

## Final verification

- `quality:pages` passes: 261 strict-checked files, 190 unit tests, 47-page
  build, formatting/lint, artifact/provenance/font/SBOM verification and zero
  known dependency findings. Transcript:
  `.tmp/quality-menu-pointer-final-2026-10-25.log`.
- All six new real mouse/touch cases pass across Chromium, Firefox and WebKit
  with one worker and no retries. Each verifies exactly one button click,
  pressed state, saved preference, Reduced tier, menu cleanup and Escape focus
  restoration. Artifacts: `.tmp/menu-pointer-final-2026-10-25/` and matching
  `.log`. Browser emulation does not prove physical-device behavior.
- Six existing Chromium regressions also pass: magnetic feedback and cleanup,
  rapid menu reopening/keyboard focus, bounded route handoffs, Reduced
  navigation, the originally failing rapid-flavor/pause scenario, and Lite
  product continuity. Retained separately in
  `.tmp/menu-reactor-regressions-2026-10-25/` and matching `.log`.
- The unchanged ×4 performance gate completed all three sessions and still
  fails. The native input fix is not a frame-budget fix. See the accompanying
  [reactor measurement](REACTOR_PREPARATION_REVIEW_2026-10-25.md).

## Five review lenses

1. Correctness/edge cases: freeze geometry through native activation; preserve
   nullable timeline/pointer state, outside releases and pointer cancellation.
   Cancel a previous release frame before a new press.
2. Architecture/lifecycle: all listeners and frames use scene-owned resources.
   `settle` cancels outstanding work before clearing styles. Keep the local
   closure state together; individual event handlers remain small rather than
   introducing a second independently owned menu controller.
3. UX/accessibility: retain real mouse/touch/keyboard activation, focus trap,
   Escape restoration and immediate reduced-motion cleanup. Assert the actual
   button receives exactly one native click, not just eventual DOM state.
4. Performance/security: one paused timeline and one cancellable release frame,
   no ongoing loop, new dependency, network operation or data collection.
   The change fixes hit targeting, not proven frame-rate performance.
5. Maintainability/release: preserve failed traces, distinguish intermediate and
   final artifacts, run the prior failing interruption contract plus new
   three-engine mouse/touch checks. Do not infer physical Safari acceptance
   from Windows WebKit automation.
