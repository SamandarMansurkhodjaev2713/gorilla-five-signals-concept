# FAQ render-tail diagnostic — 2026-10-25

Status: bounded hypothesis rejected as a production fix.

## Scope

The baseline and control use the same immutable entry-document SHA-256:
`91962ea9f6c37b9fc748b1381c98277edef073f7b923f09108897ecb18b3d2bb`.
Both run the same 1440×900 Chrome journey three times at CPU×4, including the
complete native wheel journey and unchanged 2500ms cold tail. This is diagnostic
evidence, not a release gate.

## Corrected cascade finding

The direct-scene rule in `styles/global.css` has specificity `(0,3,1)` and sets
`--scene-intrinsic-block-size: 64rem` with `content-visibility: auto`. The later
FAQ-only rule has specificity `(0,1,0)`, so its `50rem` declaration cannot win.
Removing that FAQ declaration would be a no-op; the earlier proposal to do so is
withdrawn.

The cold pre-scroll FAQ height is therefore the active 64rem/1024px placeholder,
not its natural height. The controlled parity artifact records the natural FAQ
root at 1566px in all twelve desktop captures and 1120px in all twelve phone
captures. On the measured desktop, materialization replaces the placeholder with
a root 542px taller.

## Bounded control

The control installs only an inline
`--scene-intrinsic-block-size: 1566px !important` on the FAQ root at
`DOMContentLoaded`. It does not read descendants, prewarm the subtree, alter
`content-visibility`, observer margins, choreography or durations. The existing
pre-scroll geometry stage verifies the inline/computed value and 1566px root
placeholder in every run.

FAQ top remains 7347.875px and its owned callback still activates at
`scrollY=6720` in all three controls. The footer placeholder moves down by the
expected 542px. The measured FAQ work therefore remains inside the same journey
and is not shifted beyond the observation window.

## Raw result

| Metric                    | Matched baseline                  | 1566px control                    |
| ------------------------- | --------------------------------- | --------------------------------- |
| Owned FAQ frame           | 170.319 / 206.288 / 172.800ms     | 137.260 / 248.747 / 95.963ms      |
| Blocking duration         | 108 / 142 / 106.8ms               | 77 / 170 / 35ms                   |
| Service callback          | 12.279 / 12.106 / 15.093ms        | 3.812 / 25.824 / 1.950ms          |
| Second `UpdateLayoutTree` | 23.281 / 22.973 / 26.134ms        | 23.465 / 30.041 / 8.308ms         |
| Styled elements           | 69 / 71 / 72                      | 67 / 71 / 69                      |
| Second `Layout`           | 103.099 / 136.604 / 95.785ms      | 85.137 / 132.427 / 58.889ms       |
| Layout scope              | 87 dirty / 435 total, `#document` | 87 dirty / 435 total, `#document` |

The second Layout median improves from 103.099ms to 85.137ms, and each Layout
sample is lower. The second style-update median is effectively unchanged
(23.281ms to 23.465ms), the full-document 87/435 layout remains in every run,
and control run two makes the containing frame 42.459ms worse. Callback and
frame variance are too large for a smoothness claim.

The containing frames expose no `Paint`, `Layerize`, `UpdateLayerTree` or
`CompositeLayers` event that could explain the tail. The measured cost is
dominated by style-tree update and full-document layout, not a mislabeled paint
or raster phase. The traces do not contain leaf-level invalidation reasons, so
they do not identify one descendant selector as the root cause.

## Decision

Matching the desktop intrinsic size contributes a partial Layout reduction but
does not remove the materialization pass or produce a consistent frame result.
It is rejected as a production performance fix. No CSS, motion, observer or
timing source is changed from this diagnostic.

Evidence:

- `.tmp/cold-footer-native-2026-10-25/{summary,trace}-{1,2,3}.json`
- `.tmp/cold-faq-intrinsic-control-2026-10-25/{summary,trace}-{1,2,3}.json`
- `.tmp/current-service-pair-2026-10-25-summary.json`
