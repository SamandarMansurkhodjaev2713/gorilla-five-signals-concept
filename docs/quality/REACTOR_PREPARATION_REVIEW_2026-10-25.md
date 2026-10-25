# Reactor preparation — 2026-10-25

## Outcome and scope

Preserve the complete Full/Lite product-switch choreography while removing
redundant presentation writes from its setup. The previous preparation cleared
incoming and outgoing worlds separately, then immediately normalized every
world, clearing those same targets again. The incoming argument served no other
purpose; it and the duplicate resets are removed together.

`normalizeWorlds` still clears every world before departure/arrival are created.
The outgoing marker is still restored afterwards. Rapid-intent cancellation,
timeline ownership, final cleanup, reduced motion and all visual constants are
unchanged. No animation, decorative family or product content is removed.

## Measurement boundary

The preceding corrected ×4 three-session baseline recorded product-selection
forced-layout maxima of 12.4/23.9/21.2ms and application-work maxima of
28.5/56.7/48.1ms. Its Chromium renderer was SwiftShader software; it is not
equivalent to the hardware-composited Chrome Lighthouse environment. See the
[profile and source-bound evidence](BROWSER_MEASUREMENT_CONTEXT_2026-10-25.md).

GSAP initializes computed transform geometry after presentation writes, so this
phase is a confirmed layout-sensitive path. The baseline does not provide
per-script stack attribution sufficient to blame all delay on duplicate clears.
Removing redundant writes is not itself proof of a perceptible speedup or a
complete performance fix. Original acceptance thresholds remain unchanged.

The existing catalog contract passes 42 Chromium cases, including all five
products across seven viewport shapes, history, keyboard, Reduced and no-JS
paths. Its 84 Firefox/WebKit cases are explicitly skipped by the pre-existing
suite; this is not three-engine coverage. Raw results remain under
`.tmp/reactor-single-reset-contract-2026-10-25/` and matching `.log`.

An additional post-switch check exposed a separate native menu activation
defect, not failed reactor selection or departure cleanup. See the
[menu input correction](MENU_POINTER_ACTIVATION_REVIEW_2026-10-25.md).

## Follow-up measurement

The final reactor/menu artifact completed all three unchanged ×4 sessions.
It still fails. Product-selection maxima in milliseconds:

| Session | Application work | Forced layout | LoAF blocking | Interaction |
| --- | ---: | ---: | ---: | ---: |
| 1 | 55.5 | 20.4 | 72.9 | 208 |
| 2 | 28.4 | 14.0 | 16.4 | 160 |
| 3 | 36.6 | 18.4 | 29.1 | 168 |

Startup application work was 69.2/52.8/127.5ms. Cold-scroll assertions also
failed. These variable observations do not demonstrate a dependable speedup;
the cleanup removes duplicate work but does not solve the principal delay.

All sessions report Chromium 151.0.7922.34, SwiftShader software compositing,
1440×900/DPR 1 and requested CPU rate 4 with command acknowledgment. The served
entry digest matches the build:
`6ba816743d7b7c73204585f756f48e537ff691cf524f1257516c88380878d73f`.
Evidence is private under `.tmp/performance-reactor-menu-final-2026-10-25/`
and matching `.log`. The owned performance server exited; port 4321's user
preview remains available. Keep the Full effect and all original budgets.

## Five review lenses

1. Correctness: every caller obtains incoming/outgoing worlds from the same
   scoped reactor; normalization still visits all worlds. Null outgoing remains
   valid. No selected-world or URL state changes.
2. Architecture/lifecycle: retain one canonical normalization path and remove
   its obsolete argument. Do not alter interruption tokens, owned frames,
   timeline kill behavior or outgoing settlement.
3. UX/accessibility: preserve authored trajectories, durations, ease, materials,
   keyboard/touch semantics and Full/Lite/Reduced behavior. Existing responsive,
   history and interruption contracts are the regression checks.
4. Performance/security: reduce repeated style writes without adopting an
   unproven animation driver or weakening budgets. No dependency, external
   request, environment variable or data boundary changes.
5. Maintainability/release: record scoped evidence rather than extrapolating a
   local cleanup into an Awwwards/production approval. Current Lighthouse,
   representative-device and full release requirements remain open.
