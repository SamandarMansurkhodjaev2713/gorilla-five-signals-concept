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
remain evidence; the final local-dot removal has not received a new canonical
Lighthouse batch. Do not transfer the baseline pass to this candidate.

Private reports/screenshots remain ignored under `.tmp/`; Lighthouse traces are
retained under `test-results/`. No personal paths or trace payloads are published.
The focused browser pass does not replace the complete release matrix, physical
devices, assistive-technology review or stable performance acceptance.
