# FAQ render-tail diagnostic — 2026-10-25

Status: intrinsic-size fix rejected; block-flow optimization deferred and rolled
back without causal attribution; complete-journey performance remains open.

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

## Follow-up: opaque invalidation trace

A separate CPU×4 trace queried `Tracing.getCategories` before capture. Installed
Chrome 155 advertised none of the Blink layout/debug or DevTools invalidation
categories, so none were enabled speculatively. The owned FAQ frame measured
167.197ms with a 10.966ms observer callback. Its second style update measured
21.291ms for 69 elements and its second Layout measured 99.639ms for 87 dirty
of 435 total objects. All emitted invalidations resolve only to `#document`;
there are no leaf reasons or nested per-algorithm events. This confirms an
opaque full-document Layout cost, not a particular descendant cause.

Evidence:

- `.tmp/cold-faq-invalidation-2026-10-25/trace-1.json`
- `.tmp/cold-faq-invalidation-2026-10-25/summary-1.json`

## Follow-up: root formatting-context control

Static inspection found that the outer `.home-service-dock` grid declares no
tracks, gaps, placement or alignment. It only stacks two children that already
own their grid formatting, explicit desktop minimum heights and no adjoining
block margins. A second bounded control therefore changed only the FAQ root to
inline `display: block !important` at `DOMContentLoaded`; it did not read or
prewarm descendants before activation.

| Metric                    | Matched baseline                  | Root-block control                |
| ------------------------- | --------------------------------- | --------------------------------- |
| Owned FAQ frame           | 170.319 / 206.288 / 172.859ms     | 102.123 / 97.155 / 109.489ms      |
| Service callback          | 12.279 / 12.106 / 15.093ms        | 7.224 / 6.168 / 12.351ms          |
| Second `UpdateLayoutTree` | 23.281 / 22.973 / 26.134ms        | 11.724 / 10.279 / 10.872ms        |
| Styled elements           | 69 / 71 / 72                      | 66 / 66 / 66                      |
| Second `Layout`           | 103.099 / 136.604 / 95.785ms      | 66.329 / 65.951 / 69.237ms        |
| Layout scope              | 87 dirty / 435 total, `#document` | 87 dirty / 435 total, `#document` |

The whole-frame median falls from 172.859ms to 102.123ms, the second style
update median from 23.281ms to 10.872ms, and the second Layout median from
103.099ms to 66.329ms. Every controlled frame is lower than every matched
baseline frame, but 102.123ms remains far outside the 16ms acceptance budget.

Cold geometry is unchanged in all runs: FAQ top 7347.875px, skipped height
1024px, and activation at `scrollY=6720`. After materialization the root is
1440×1566, its index is 1440×756, and contact is 1440×810. Root/index/contact
positions and the root rule plus index divider pseudo-element metrics match in
all three captures. Post-trace screenshots retain the expected composition.

Blink implements grid and block layout through distinct LayoutNG algorithms:
see the primary [LayoutNG overview](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/layout/README.md),
[GridLayoutAlgorithm](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/layout/grid/grid_layout_algorithm.cc)
and [BlockLayoutAlgorithm](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/layout/block_layout_algorithm.cc).
The consistent control result supports formatting-context overhead as a
mechanism hypothesis; it is not leaf-level proof, which the installed trace
cannot provide.

### Promotion state

The candidate was **not promoted**. A hot same-mounted grid→block matrix passed
40 Chrome/Firefox pairs, but its 20-pair WebKit leg produced geometry failures
and four perceptual failures. That evidence remains authoritative for the hot
transition and is not reclassified by the later test.

The terminal fresh-page WebKit matrix also fails its strict pre/post stability
gate in 20/20 pairs. Read-only attribution of the saved evidence shows that the
final grid and block states nevertheless match exactly in all 20 pairs: numeric
ranges, pseudo-elements and PNG pixels have zero differences. The grid baseline
changes glyph metrics between pre/post capture in 20/20 pairs; the block page is
unstable in four phone pairs only, where the entire document receives the same
vertical translation already present in its matched grid baseline:

- UZ 360: 6657.14→6600.83px;
- EN 360: 6673.70→6561.08px;
- UZ 390: 6686.70→6630.39px;
- EN 390: 6702.52→6589.89px.

Both matched roots remain 1120px high. No local block-only glyph change is
observed, but requested CSS fonts and loaded `FontFace` metadata do not prove
which physical face populated a pre-paint layout cache. Therefore the failed
strict report is retained, final-state equality is only bounded supporting
evidence, and browser compatibility is not declared.

The actual-source block candidate passed its source gate on entry SHA-256
`46cdaed7beadf5637f16a6c23639fee946b70eeaa00e26cedebd1a40d41148fd`:
358 strict files, 463 units, coverage 96.79/93.95/97.42/97.67, 47 pages,
617-component SBOM and audit 0. Its functional batch then passed 46/51 and
failed five WebKit cases: two desktop Full cases stayed in runtime `loading`,
two desktop Lite cases exceeded the 45s wheel boundary, and one entry-locale
navigation did not change URL. The root cause is unproven; load or gate
relaxation is not used to excuse the failures.

The candidate was therefore rolled back. Production CSS is restored exactly to
the HEAD root grid; the block-only source unit and computed-display assertion
are removed. An implementation-independent RU 390 details-geometry test remains:
it passes Chrome, Firefox and WebKit and verifies root/index/contact height sums,
positive growth after opening all three answers, equal contact displacement and
exact geometry restoration after close.

Restored-source quality passes with 357 strict files, 462 units, coverage
96.79/93.95/97.42/97.67, 47 pages, SBOM 617 and audit 0. The local entry SHA-256
is again exactly
`91962ea9f6c37b9fc748b1381c98277edef073f7b923f09108897ecb18b3d2bb`, and
`git diff -- src` is empty. The restored grid 51-case causal control also passes
46/51 and reproduces the exact same five WebKit case identities. The block
property is therefore **not established as the cause** of those failures.

The earlier restored-source 48-case pass remains historical evidence; it does
not override the latest 51-case failure. Block flow stays deferred and
unpromoted pending independent startup isolation, not classified as a proven
CSS regression. No block candidate exists in production source or Pages.

A read-only startup audit identifies remaining load/idle awaits, engine imports,
three immediate-RAF gates and 18 Full Hero stage RAFs, but no font or media await.
The next bounded probe should observe schedule and delivery plus runtime/scene
states without changing timeouts.

Evidence:

- `.tmp/cold-faq-block-control-2026-10-25/{summary,trace}-{1,2,3}.json`
- `.tmp/cold-faq-block-control-2026-10-25/faq-post-cold-{1,2,3}.png`
- `.tmp/faq-display-block-fresh-webkit-2026-10-25/raw.json`
- `.tmp/faq-display-block-fresh-webkit-2026-10-25/comparison-validated-summary.json`
- `.tmp/faq-display-block-fresh-webkit-2026-10-25/derived-paint-state-attribution.json`
- `.tmp/quality-service-block-final-2026-10-25.log`
- `.tmp/service-block-functional-fail-2026-10-25/`
- `.tmp/quality-service-flow-restored-2026-10-25.log`
- `.tmp/service-flow-restored-functional-2026-10-25.log`
