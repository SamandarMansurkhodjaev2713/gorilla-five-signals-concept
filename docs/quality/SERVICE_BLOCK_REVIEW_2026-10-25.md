# Service Dock block-flow five-lens review — 2026-10-25

Status: optimization deferred and unpromoted; trial rolled back, restored grid
reproduces the same five WebKit failures, so CSS causality is not established.

## Evidence boundary

This review covers the rejected one-property trial: the Service Dock root became
block flow while its two panels remained grids. The three-run CPU×4 control used
frozen entry SHA-256
`91962ea9f6c37b9fc748b1381c98277edef073f7b923f09108897ecb18b3d2bb`.
It is diagnostic evidence, not a measurement of the newly built source.

## Five-lens review

### 1. Correctness and lifecycle

The root has no authored grid tracks, gap, placement or alignment, and its two
children have no adjoining block margins. Block flow preserves their order,
full width and 756px + 810px desktop heights. The control retains the 1024px
cold placeholder, `scrollY=6720` activation, 1566px natural root, clipping and
pseudo-elements in all three runs. Motion targets, ownership, cancellation,
Reduced and no-JS behavior are untouched.

The trial's block-specific source unit and computed-display E2E assertion were
removed with the rollback. The retained implementation-independent RU 390 test
checks, in all three engines, root/index/contact height sums, positive growth
when all three answers open, equal contact displacement and exact restoration
after closing. It measures the painted geometry without transient font queries.

### 2. Architecture and boundaries

In the trial, layout responsibility was narrower: the root owned vertical
document flow while the index and contact panels owned their internal grids. No
selector crossed into the native-player core, no JavaScript branch was added,
and no feature contract or public type changed. Rollback restored the original
root grid and removed its focused block assertions.

### 3. UX, accessibility and responsive behavior

The Chrome control preserves measured desktop geometry and post-trace
composition. The fresh-page WebKit post-state grid/block comparison is exact in
20/20 pairs for numeric ranges, pseudo-elements and PNG pixels; both phone roots
remain 1120px high.

The strict WebKit pre/post gate nevertheless fails 20/20. Grid glyph metrics are
unstable in 20/20; block is unstable in four phone pairs, limited to the same
whole-document Y translation seen in each matched grid baseline. This excludes
a demonstrated block-local glyph regression but does not turn the strict gate
green. Physical font-face use before paint is not proven. Browser compatibility,
zoom, assistive technology and production entry-paint remain open.

### 4. Performance, reliability and security

Matched Chrome CPU×4 results are:

| Metric                    | Grid median | Block median |
| ------------------------- | ----------- | ------------ |
| Owned FAQ frame           | 172.859ms   | 102.123ms    |
| Second `UpdateLayoutTree` | 23.281ms    | 10.872ms     |
| Second `Layout`           | 103.099ms   | 66.329ms     |

Every controlled frame beats every matched baseline frame, while the Layout
scope remains 87 dirty of 435 total objects rooted at `#document`. The result is
consistent but still fails 16ms, and opaque tracing does not identify a leaf
cause. A source-built CPU×4 trace cannot override the later functional rejection;
any terminal result is diagnostic history only. Frame/global pre-paint work
remains unresolved.

The property introduces no async path, listener, dependency, request, secret,
storage, CSP, authorization or data-processing change. Reliability risk is
layout compatibility, covered only partially by current evidence.

### 5. Maintainability and release safety

The candidate implementation had a one-property rollback and no duplicated
timing or motion logic. Candidate source quality passed: 358 strict files, 463
units, coverage 96.79/93.95/97.42/97.67, 47 pages, SBOM 617 and audit 0 on entry
SHA-256 `46cdaed7beadf5637f16a6c23639fee946b70eeaa00e26cedebd1a40d41148fd`.

Its functional gate passed 46/51 and failed five WebKit cases: two desktop Full
runtime-ready waits remained `loading`, two desktop Lite journeys exceeded the
45s overall test deadline, and one locale navigation did not change URL. Root cause is
unproven and no load explanation, retry or gate relaxation is accepted. CSS is
restored exactly to HEAD grid; candidate-specific tests are removed.

Restored-source quality passes with 357 strict files, 462 units, unchanged
coverage 96.79/93.95/97.42/97.67, 47 pages, SBOM 617 and audit 0. Local entry
SHA-256 returns exactly to
`91962ea9f6c37b9fc748b1381c98277edef073f7b923f09108897ecb18b3d2bb`, and
the source diff is empty. The restored 51-case control also passes 46/51 and
fails the same five WebKit case identities. This prevents causal attribution to
the block property; it does not turn either 51-case run green. The earlier
48-case grid pass remains historical only.

Block flow is deferred and unpromoted pending independent startup isolation.
The next observation should record schedule/delivery and runtime/scene states
without timeout changes. Read-only inspection identifies load/idle awaits,
engine imports, three immediate-RAF gates and 18 Full Hero stage RAFs, but no
font or media await. Failed intrinsic, strict WebKit and functional evidence
stays linked and unchanged.

## Acceptance ledger

| Gate                           | Status                                                               |
| ------------------------------ | -------------------------------------------------------------------- |
| Three-run inline CPU×4 control | Supported, but frame remains over budget                             |
| Desktop geometry/pseudos       | Pass in the bounded Chrome control                                   |
| Hot Chrome/Firefox matrix      | Pass: 40 pairs                                                       |
| Hot WebKit matrix              | Failed: geometry plus four perceptual failures                       |
| Fresh-page WebKit strict gate  | Failed: 20/20; final post-state equality is supporting evidence only |
| Candidate source quality       | Pass on SHA `46cdae…`: 358 strict, 463 units, build 47, audit 0      |
| Candidate functional matrix    | **Fail:** 46/51; five WebKit failures                                |
| Rollback                       | Pass: HEAD grid restored; block-only contracts removed               |
| Independent details geometry   | Pass: RU 390 in Chrome, Firefox and WebKit                           |
| Restored-source quality        | Pass: 357 strict, 462 units, build 47, audit 0                       |
| Restored 51-case control       | **Fail:** 46/51; exact same five WebKit cases                        |
| CSS causal attribution         | Not established; restored grid reproduces failures                   |
| Production/release gate        | Deferred/unpromoted; wider gate remains open                         |

See [ADR-0016](../decisions/ADR-0016-service-block-flow.md) and
[the diagnostic record](FAQ_RENDER_DIAGNOSTIC_2026-10-25.md).
