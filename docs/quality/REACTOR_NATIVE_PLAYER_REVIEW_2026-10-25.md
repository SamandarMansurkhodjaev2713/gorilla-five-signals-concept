# Native Reactor candidate: five-lens review

Status: local candidate, publication held; not full release acceptance.

## Outcome and scope

Reduce finite product-transition JavaScript work while preserving the Industrial
Editorial composition, every flavor trajectory, complete Full/Lite timing,
important-style fallback, exact ownership cleanup, keyboard/history and Reduced.
No product copy, claims, assets, dependencies, CSP or global GSAP ticker policy
changes. Public main/Pages remain unchanged under the user's publication choice.

## 1. Correctness and edge cases

The native plan uses shared motion values and explicit role endpoints. Full ends
at 2256ms; Lite ends at 540ms with outgoing content or 380ms without it. Typed
transform decomposition handles reflected/scaled/skewed 2D poses and anchors;
non-finite, singular or 3D matrices reject to fallback rather than approximation.
Timing validation rejects invalid plans before allocating effects. Tests exercise
partial construction, inactive clocks, cancellation failures and exact causes.

The frozen GSAP baseline exposed double percentage/pixel copy displacement.
Explicit `x: 0` at both Full-copy endpoints corrects its cleanup jump; regression
coverage spans all five flavors. Current parity compares corrected GSAP, not a
silently changed historical baseline.

## 2. Architecture, coupling and cleanup

Pure math/easing/plan modules do not touch the DOM. The scoped reader completes
every read before native effect creation. The player owns a finite effect array,
one AbortController and terminal listener; destroy cancels all and empties its
collection without committing styles. The existing transition owner restores
eight exact inline declarations/priorities and preparing/leaving leases.

The cohesive cue table is a reviewed physical-line-count exception, not a mutable
god service: separating role files would obscure the verified append schedule.
No private GSAP caches, ambient context manipulation or global kill is used.
Unsupported important/style cases intentionally retain the original GSAP path.

## 3. UX, responsive behavior and accessibility

Controlled pairs cover five flavors × Full/Lite × 390/1440 widths ×
initial/outgoing: 40 pairs per engine at eight milestones, including 1900ms within
shard entrance. Each engine records 640 backend samples and 80 final cleanup
states. Rect deltas are below 0.334px, opacity below 0.000072, transform linear
components below 0.000281 and translation below 0.061px, within unchanged bounds.

Raw Firefox clip precision differences remain in the original comparison. A
separate finite `none`/inset parser compares resolved edges with a 0.25px bound;
actual maximum is below 0.000012px. Unknown shapes still fail. Controlled seeking
and finishing does not prove natural completion, frame rate or native input.

The actual input batch executed 57 cases: 56 passed; WebKit Lite 1440 failed to
complete the fallback after rapid keyboard/back/forward. Trace shows correct
lease handoff and ongoing GSAP style advancement, not a wrong selected world.
Sparse RAF plus GSAP lag smoothing is a diagnostic hypothesis, not a proven
root cause. One diagnostic run and six further isolated repeats passed without
changing production code. The initial failure remains unresolved; no timeout,
retry, skip or acceptance threshold was weakened. Failure attachments now retain
active animation states, leases and bounded frame-gap observations.

## 4. Performance, security and dependency risk

`linear()` easing sampling is tested against the installed GSAP implementation
over dense intervals; opacity/travel/rotation error budgets are explicit.
Capability checks include real easing parsing, not only property presence.
No dependency or externally supplied asset/data is added. Candidate audit reports
zero advisories; that does not describe advisories on the unchanged public main.

Complete-window CPU×4, hardware attribution and resource evidence remain separate
from functional parity. The observation tail stays 2500ms and the hard
16/50/200ms budgets are unchanged. Nothing is scheduled beyond the measured
window to manufacture a pass. Lighthouse/device gates are not waived.

### Complete-window result: failed

The canonical three-session CPU×4 journey used the frozen local HTML SHA-256
`851574d4b1b934529762fc05d761c7a66aa9a9c20c795a8edd9f12e6a2c1fd01`.
The recorded renderer is Chromium 151 / Windows / SwiftShader software
compositing, not physical-device or hardware-GPU acceptance. Maximum application
work within observed Long Animation Frames, milliseconds:

| Phase | Run 1 | Run 2 | Run 3 |
| --- | ---: | ---: | ---: |
| Confirmation/startup | 37.6 | no LoAF recorded | no LoAF recorded |
| Cold scroll | 23.2 | 12.4 | 44.9 |
| Product selection | 9.4 | 12.8 | 24.8 |

No recorded LoAF is not a claim that every frame took zero work. Run 3 selection
also reached a 144ms long task, 98.9ms LoAF blocking and 224ms Event Timing
interaction duration; runs 1/2 interactions peaked at 136/200ms. These failures
reject release acceptance despite some phases improving. All fifteen phase
payloads and three rendering/artifact payloads are retained in the HTML report
embedded ZIP, plus the trace:
`.tmp/reactor-native-player-performance-report-2026-10-25/index.html`;
log `.tmp/reactor-native-player-performance-2026-10-25.log`.

Separate installed Chrome hardware-GPU CPU×4 attribution also covers the full
2500ms tail in three fresh contexts. Cold application callbacks peaked at
46.453/34.486/41.552ms; selection callbacks peaked at 15.312/21.459/33.847ms.
Blank-URL Playwright RAF instrumentation is retained but excluded from these
application-only callback figures. This diagnostic still fails the 16ms target;
it is not a replacement gate. Raw events, GPU metadata and matching artifact
hashes are in `.tmp/cold-native-player-2026-10-25/`.

Cold attribution maps the anonymous observer callback to actual scene entrances,
not to a costly `rootMargin` property. Material-film initialization costs
46.5/33.1/29.7ms and performs nine style-tree updates/eight layouts per run;
manifesto costs 22.0/25.7/20.5ms with eighteen style-tree updates/five layouts;
terminal costs 25.4/21.0/18.1ms with eighteen style-tree updates and no layout.
The repeated synchronous GSAP `.from` groups are the measured next targets.
This attribution does not claim those scenes are already fixed.

### Separate resource stress: bounded result, not universal leak proof

One thousand synthetic `gorilla:selection-change` events each allow three native
RAFs and require actual native prefix effects; no native history writes are
faked. Maximum live owned effects is 12, leaving/preparing worlds at most one.
At idle checkpoints 0/200/1000, after 2500ms natural settlement, all owned effects
and leases are gone, exact authored inline declarations are restored, and the
URL/history length are unchanged. The two idle checkpoints mean this is not
literally 1000 uninterrupted in-flight cancellations.

Separate forced-GC heap snapshots retain zero native-player objects, one
transition object and zero Animation objects at every checkpoint. Eleven native
KeyframeEffect nodes remain constant and include unrelated CSS effects. The
actual frozen-bundle minified constructor mapping is retained as diagnostic
evidence, not universal object-identity proof. Total heap usage grows from
3,033,792 to 3,382,004 bytes: no claim of zero total heap growth is made.
Snapshots stay below the 96MiB cap; the run finishes within its 180s deadline
with no runtime/cleanup errors. All owned browser resources close independently.
Evidence: `.tmp/reactor-native-resources-1000-2026-10-25.json` and its three raw
heap snapshots. This explicit synthetic resource/GC diagnostic is not real-user
input, native FPS or a replacement for the failed performance gate.

### Lighthouse public-readiness result: failed

Nine audits use the actual public base path and a separately built public-readiness
artifact, not the local preview hash. Its entry SHA-256 is
`9531534393946d871088bb145e7dfc5df7440f8bb3f3b2df1f7c721f39f9e040`.
Three-run medians:

| Route | Performance | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: |
| Uzbek home | 90 | 3475ms | 99.5ms | 0 |
| Original product | 98 | 2190ms | 0ms | 0 |
| Find | 99 | 1964ms | 0ms | 0 |

All audited accessibility/best-practices/SEO scores are 100, not a substitute for
manual accessibility/device testing. Homepage Performance 85/90/91 and LCP above
2.5s fail the unchanged gate. The product's third run scores 79 with 797.6ms TBT,
despite its passing median; this outlier is retained as a stability concern.
No median or individual run is discarded to obtain a pass. The runner exits 1.
Summary and raw traces/reports: `test-results/lighthouse/`; command log:
`.tmp/lighthouse-native-reactor-2026-10-25.log`. Public deployment remains held.

LCP attribution selects the same eager, high-priority 320w Original can in all
three homepage runs. Its observed request finishes within 63–104ms; observed
render delay dominates its load duration. Fresh audit profiles have not confirmed
responsible entry, so the runtime exits before loading GSAP: Hero staged boot
cannot explain this particular cold-entry LCP. Confirmed startup performance is
still independently failed by the journey above.

The next narrow control is to inspect whether content obscured by the open entry
dialog should be excluded from painting, preserving the existing composition,
no-JS access and confirmed-session behavior. That is a hypothesis, not an applied
fix or permission to hide visible product content for a score. Compare fresh and
confirmed entry separately before adoption. A correctly sized smaller can
derivative is a separate asset-only control, not a reason to alter discovery or
the required early history bridge. No production gate or image change was made
from this attribution alone.

## 5. Maintainability, documentation and release readiness

ADR-0011 documents native/fallback ownership and rejection boundaries. The plan,
README and QA status distinguish candidate implementation from publication.
Native modules are now explicitly included in coverage; global thresholds are
unchanged. Source/artifact checks pass with 309 strict files, strict browser
bootstrap, 377 unit tests, a 47-page build, fonts, budgets, provenance, CycloneDX
617-component SBOM and dependency audit.

Private source log: `.tmp/quality-reactor-native-verified-2026-10-25.log`.
Browser logs: `.tmp/reactor-native-live-browser-2026-10-25.log`,
`.tmp/reactor-native-webkit-diagnose-2026-10-25.log`,
`.tmp/reactor-native-webkit-repeat-2026-10-25.log`.
Controlled raw/strict/semantic reports are retained separately as
`.tmp/reactor-controlled-{current,firefox,webkit}-pair-2026-10-25*.json`.
Public acceptance remains incomplete; a successful source gate is not a deploy.
