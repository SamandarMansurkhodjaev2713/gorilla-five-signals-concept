# ADR-0016: Defer Service Dock root block flow

Status: deferred and unpromoted; trial rolled back, CSS causality not established.
Date: 2026-10-25.

## Context

The Service Dock root used grid only to stack its FAQ and contact panels. It
declared no tracks, gaps, placement or alignment; each child already owns its
grid and explicit responsive minimum height. Chrome CPU×4 traces attribute the
cold FAQ tail to an opaque second full-document Layout rather than its finite
entrance callback. The installed browser exposes no leaf invalidation category,
so a descendant cause cannot be claimed.

An intrinsic-size control was rejected: it retained the 87/435 full-document
Layout and produced inconsistent whole-frame results. A separate three-run
control changed only the root formatting context to block before scrolling. Its
whole-frame median fell from 172.859ms to 102.123ms, second style-update median
from 23.281ms to 10.872ms, and second Layout median from 103.099ms to 66.329ms.
Cold position, activation at `scrollY=6720`, natural 1566px desktop height,
child heights and pseudo-elements stayed unchanged. The frame still fails 16ms.

## Trial decision

The trial branch changed only `.home-service-dock` from `display: grid` to
`display: block`; `.home-service-dock__index` and
`.home-service-dock__contact` remain grids. The root retains relative
positioning, clipping, color and background. No motion schedule, observer,
content-visibility policy, intrinsic placeholder, component markup or timing
changes.

The trial added a source contract for block flow and a computed-display E2E
assertion. These were candidate-specific guards, not independent product
requirements.

## Browser evidence and limits

The earlier hot same-mounted matrix passed 40 Chrome/Firefox pairs. Its WebKit
leg retained geometry failures and four perceptual failures. A subsequent
fresh-page WebKit matrix initializes grid or block before first materialization,
matching the production lifecycle more closely, but still fails the strict
pre/post gate in 20/20 pairs.

Saved-data attribution shows exact final grid/block equality in all 20 pairs,
including numeric ranges, pseudo-elements and PNG pixels. Grid itself changes
pre/post glyph metrics in 20/20 pairs. Block changes in four phone pairs only by
the same whole-document vertical translation as the matched grid baseline; both
roots stay 1120px high and no block-local glyph change appears. Requested font
and loaded-face metadata do not identify the physical face used by a pre-paint
layout cache, so strict failures remain failures and cross-browser readiness is
not declared.

## Rejected alternatives

- Promote the intrinsic-size control: it is noisy and does not remove the
  full-document pass.
- Remove content visibility or pre-materialize the subtree: this moves work
  outside the measured window and changes the established loading contract.
- Change child grids: they own real two-dimensional panel layout and were not
  isolated by the control.
- Reduce motion or weaken the frame budget: neither addresses formatting work.
- Reclassify WebKit failures from post-state equality: measurement-phase
  attribution does not convert a failed strict gate into a pass.

## Deferral and rollback

The actual-source candidate passed formatting, lint, 358 strict files, 463 unit
tests, coverage 96.79% statements / 93.95% branches / 97.42% functions / 97.67%
lines, the 47-page build, 617-component SBOM and audit 0. Its entry SHA-256 was
`46cdaed7beadf5637f16a6c23639fee946b70eeaa00e26cedebd1a40d41148fd`.

The required functional batch passed 46/51 and failed five WebKit cases: two
desktop Full cases never advanced runtime state from `loading`, two desktop Lite
cases reached the 45s overall test deadline, and one entry-locale navigation did not
change URL. Root cause remains unproven. The failures are not waived as load,
retried into a pass or hidden by a threshold change.

The block declaration, block-only unit and computed-display assertion are
removed; production CSS is restored exactly to the HEAD grid. The only retained
source addition is an implementation-independent three-engine RU 390 dynamic
details test covering panel-height sums, real expansion, equal contact movement
and exact close restoration. It passes all three engines.

Restored-source quality passes with 357 strict files, 462 units, coverage
96.79/93.95/97.42/97.67, 47 pages, SBOM 617 and audit 0. Its local entry SHA-256
is again exactly
`91962ea9f6c37b9fc748b1381c98277edef073f7b923f09108897ecb18b3d2bb`, with an
empty source diff.

The restored grid causal control also passes 46/51 and fails the exact same five
WebKit case identities as the block candidate. The CSS property is therefore
not established as their cause. The earlier 48-case grid pass remains valid
historical evidence, but the latest 51-case failure remains the current gate.
Block flow is deferred and unpromoted pending independent startup isolation; it
is not classified as a proven CSS regression. No block-flow candidate is in
production source or Pages.

The bounded Chrome improvement remains useful diagnostic history. Frame/global
pre-paint work and complete-journey startup reliability remain open. Read-only
inspection finds load/idle awaits, engine imports, three immediate-RAF gates and
18 Full Hero stage RAFs, with no font or media await. The next observational
probe must record schedule/delivery and runtime/scene states without changing
timeouts.

Evidence and exact measurements are retained in
[the FAQ render diagnostic](../quality/FAQ_RENDER_DIAGNOSTIC_2026-10-25.md),
`.tmp/cold-faq-block-control-2026-10-25/` and
`.tmp/faq-display-block-fresh-webkit-2026-10-25/`. Candidate quality and failure
artifacts remain in `.tmp/quality-service-block-final-2026-10-25.log` and
`.tmp/service-block-functional-fail-2026-10-25/`. Restored evidence remains in
`.tmp/quality-service-flow-restored-2026-10-25.log` and
`.tmp/service-flow-restored-functional-2026-10-25.log`.
