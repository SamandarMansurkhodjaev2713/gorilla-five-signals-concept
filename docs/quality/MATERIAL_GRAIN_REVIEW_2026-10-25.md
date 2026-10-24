# Material refinement — 2026-10-25

## Scope and decision

Replace the global concentric procedural gradients with an original, deterministic
96×96 neutral grain tile (2,605 bytes). Remove the redundant soft-light dot layer
from the moving product-world art. Preserve geometry, product assets, lighting,
legal information, motion timing and reduced-motion behavior.

This is a material refinement and a partial runtime improvement, not release
approval or a claim that all animations are smooth.

## Five review lenses

1. Correctness: four generator tests cover deterministic bytes, independent
   buffers, neutral color/alpha distribution and encoded size/dimensions. Thirty
   browser cases pass across Chromium, Firefox and WebKit: native image delivery,
   byte identity, phone/desktop layering, forced colors and all five product worlds.
2. Architecture: a pure generator core is separate from the Sharp filesystem
   adapter. No new dependencies, runtime listeners, timers or animation owners.
   The redundant pseudo-element is deleted rather than disabled by an override.
3. UX/accessibility: eight paired global-material screenshots and four paired
   local-layer screenshots retain layout and legibility. The final local-layer
   comparison covers Original desktop and Zero phone, JS enabled, reduced/static,
   confirmed session, responsible marker visible and dialog closed. These are
   bounded static comparisons, not all-screen or normal-motion acceptance.
4. Performance/security: the asset adds 2.6KB compressed and 36KB decoded. A
   controlled local-layer removal pair improves Chromium active-frame median from
   33.3ms to 16.7ms; WebKit improves from 783ms to 581ms but remains unacceptable.
   A separate passive inline-style observer on final source records Chromium
   16.7ms median/600.6ms completion and WebKit 603ms/10,890ms completion. No clock
   forcing, reduced DPR, synthetic completion or per-frame layout reads.
5. Maintainability/release: reproducible command, ownership and hashes are in
   README/provenance; byte and browser contracts prevent a missing-image false
   pass. Keep PR draft and release gates open.

## Performance evidence limitations

Final `quality:pages` passed on Node 24.16.0: formatting, lint, strict diagnostics
on 249 files, 177 unit tests, 47-page production build, artifact/content/font
checks, four grain tests, provenance for 11 records, SBOM/license verification
for 617 components and dependency audit with no known vulnerabilities. The
30-case focused browser pass is separate from this source/artifact pipeline.

The pre-change canonical Lighthouse batch passed numerically, but homepage LCP
was 2,499.98055ms: effectively no headroom. The subsequent global-PNG batch
**before local-dot removal** failed: homepage Performance 84/TBT 527.53ms,
Original 92/300.65ms, locator 89/431ms. All three had zero CLS. These failures
remain evidence. Do not transfer the baseline pass to this candidate.

The final `4e84881` canonical public-path median-of-three batch also **failed**:

| Route | Performance | LCP, ms | TBT, ms | CLS |
| --- | ---: | ---: | ---: | ---: |
| Homepage | 72 | 2263.9388 | 1581.7781 | 0 |
| Original | 66 | 2183.5109 | 4882.9375 | 0 |
| Locator | 99 | 1963.5377 | 39.115575 | 0 |

Accessibility, best practices and SEO were 100 on all three medians. The actual
public-base texture request returned 200 with 2,605 bytes. Original run 2 still
contains a 5,145ms `Unattributable` long task; script evaluation totals 76.74ms
while `Other` totals 5,464.95ms. These attribution limits do not establish a
specific browser/GPU cause or justify blaming JavaScript. All nine traces and
DevTools logs remain private. No repeated batch was run to seek a green result.

## Original metal lighting follow-up

A separate bounded WebKit pair removed only `.original-metal` box shadows,
leaving its child shadows, packshot filters, artwork, geometry and motion intact.
Native completion changed from 10,866ms to 1,516ms, but median active intervals
were still 597ms versus 486ms. The candidate contains just three RAF samples and
four distinct inline poses: this is not smoothness acceptance. A gradient-based
inset-lighting replacement received a separate bounded comparison before source
adoption; deleting material depth solely for a faster completion marker is not
an acceptable design result.

The replacement prepends one named local-space shading gradient to the existing
stripe/metal backgrounds and removes the slab shadow. Original at 1440px and
390px retains depth and geometry in four paired screenshots; the left edge is
slightly brighter, while packaging, warnings and text remain unchanged. The
WebKit pair records source 10,202ms completion/597ms median, versus gradient
1,039ms completion with **only two RAF samples and three actual poses**. The
candidate has one 497ms interval and fails the minimum sample count. This
supports a lighter material implementation, not an FPS or smoothness claim.

Follow-up review lenses:

1. Correctness: scoped Original-only background change; other worlds untouched.
   Native CSS contracts check three layers, shape/transform and both wet details.
2. Architecture: no wrapper, pseudo-element, runtime effect, dependency or new
   paint owner; the material token stays with the Original feature stylesheet.
3. UX/accessibility: desktop/phone static comparisons preserve composition,
   controls and responsible information; no motion preference is changed.
4. Performance/security: natural motion clocks remain unchanged; completion and
   frame pacing are reported separately. No additional media or external calls.
5. Maintainability/release: regression tests cover two widths in three engines;
   the pre-lighting Lighthouse failure remains open and is not superseded by a
   static contract or a faster completion marker. Full release remains unproven.

Post-adoption checks: 47-page build, lint, strict diagnostics on 250 files and
36/36 focused browser cases (six lighting plus thirty grain) passed. The earlier
177-unit/audit evidence belongs to `4e84881`; no domain logic or dependencies
changed in the lighting follow-up. A fresh full release suite has not run.

Private reports/screenshots remain ignored under `.tmp/`; Lighthouse traces are
retained under `test-results/`. No personal paths or trace payloads are published.
The focused browser pass does not replace the complete release matrix, physical
devices, assistive-technology review or stable performance acceptance.
