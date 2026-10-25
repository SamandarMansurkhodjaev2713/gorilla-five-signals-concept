# Service native entrance and discovery-priority review — 2026-10-25

Status: bounded source, parity, hardware, Lighthouse and functional gates pass;
wider performance and release gates remain open.

This review separates two bounded changes: moving the existing Service Dock
entrance onto the shared finite native player, and marking the five trace-identified
decorative lazy images with explicit Low fetch priority. Neither change is a
release claim.

## Evidence before the change

- Hardware CPU×4 FAQ Service callbacks: 35.900/29.193/6.651ms, with
  10/11/10 nested `UpdateLayoutTree` events and zero `Layout` events.
- Independent Footer callbacks: 45.679/11.557/18.882ms, with 11 style updates
  and five layouts. Footer remains out of scope and open.
- Preserved home simulated LCP: 3482.981/2409.745/3472.275ms. The observed LCP
  is the responsible-entry age text at 408/349/341ms.
- The four lazy Hero ghosts plus Manifesto carrier total 178,028 bytes. All start
  Low with an `auto` fetch-priority hint; promotion counts are 5/0/5 in the three
  runs, matching fail/pass/fail but not yet proving causality.
- The primary Hero image is already eager/high. Preloaded Latin fonts finish in
  40–52ms, and the history bridge reports zero estimated render-blocking savings.

The original Lighthouse traces remain archived under
`.tmp/lighthouse-before-service-priority-64de987-2026-10-25/`. The candidate must
be compared against those traces without replacing them.

## Five-lens self-review

### 1. Correctness and lifecycle

The Service adapter preserves the existing target order, easing and timing from
one named motion spec. Full builds 12 effects and completes at 1000ms; Lite builds
six and completes at 940ms. Required target absence throws before native effect
allocation, is diagnosed by the owner and triggers an independently validated
fallback attempt; optional rows may be empty. Every plan reaches the visible
terminal pose before exact inline cleanup returns ownership to the stylesheet.

The shared finite entrance owner controls one native player or one scoped GSAP
fallback. Known unsupported input falls back; unexpected failures are reported.
Destroy, partial setup, synchronous completion and late callbacks converge on
owned cleanup. Fallback work is stopped before exact inline value/priority
restoration, preventing a context teardown from overwriting the snapshot.

The priority change retains lazy loading, async decoding, intrinsic dimensions,
responsive source selection and empty decorative alt text. The primary image's
eager/high/synchronous contract is asserted independently.

The controlled Service matrix passes 12 matched native/GSAP pairs and 24
captures across Chrome, Firefox and WebKit, Full/Lite and 390/1440px. Natural
cleanup passes 24/24 and exact eight-property inline restoration passes for both
backends in 24/24 captures. Font metadata is equal and application/cleanup
errors are zero. Maximum rect and matrix deltas are zero; opacity delta is
0.000064 and clip delta is 0.029357px, within unchanged budgets.

The capture process saved all successful raw cases and cleanup evidence, then
exited 1 because an obsolete Terminal-only summary reporter could not describe
Service. A standalone JSON comparator consumed the saved artifact without a
recapture and passed every case with exit 0. This is an operational reporter
defect, not a browser, application or cleanup failure. The combined functional
batch then passes cancellation, route/reload, Reduced and no-JS behavior.

### 2. Architecture and type boundaries

Service Dock is the fifth feature adapter over the neutral finite player, beside
Reactor, Material Film, Manifesto and Terminal. Feature selectors, target shape,
cue schedule and diagnostic namespace remain outside the neutral core. The thin
owner adapter injects native creation, snapshot capture and GSAP fallback into the
shared lifecycle owner rather than copying that state machine.

All variant modes use explicit unions and typed target contracts. Browser effects
stay at the motion adapter boundary; content and component records do not import
motion. The two candidate changes share an artifact only for valid comparison,
not a runtime dependency.

The frozen combined artifact passes formatting, lint, 344 strict files and 449
units. Coverage is 96.69% statements, 93.82% branches, 97.28% functions and
97.59% lines.

### 3. UX, accessibility and responsive behavior

No copy, hierarchy, focus order, control behavior, legal-entry behavior or
responsive geometry is intentionally changed. Full keeps the contact word/copy
choreography; Lite omits only the same effects it omitted before. Reduced and
no-JS stay immediately readable.

Fetch priority does not change responsive image candidates or reserve less space.
The five affected images are decorative or below-fold presentation; the visible
primary product remains eager/high. A passing score cannot waive visual,
cross-engine or entry-paint regressions.

Phone/desktop cross-engine parity passes in the controlled matrix. The existing
entry-paint functional matrix also passes on the exact final artifact.

### 4. Performance, reliability and security

The Service native path creates a finite cue batch without computed-style or
geometry reads and retains deterministic cancellation. Three current-artifact
hardware CPU×4 traces measure its callback at 10.005/9.007/11.388ms. All three
pass the unchanged 16ms gate with zero nested `UpdateLayoutTree`, `Layout` or
forced-style/layout events. The prior callback was 35.900/29.193/6.651ms, so the
median changes from 29.193ms to 10.005ms.

That bounded result does not establish a smooth rendered frame. Containing
frames remain 155.2/106.9/112.8ms with blocking work of 93.8/46.5/56.0ms;
render tails are 131.1/85.9/92.0ms and style/layout tails are
123.5/83.0/89.4ms. The containing-frame median changes from 137.3ms to 112.8ms
and its maximum from 204.3ms to 155.2ms, while run three worsens from 104.8ms to
112.8ms. End-to-end performance therefore remains failed.

The discovery candidate was tested by a canonical nine-run Lighthouse batch with
both LCP and raw priority changes. All five images declare a Low hint, begin Low
and record zero promotions before LCP in each home run; the baseline was 5/0/5.
Home Performance is 97/98/98, LCP is
2340.865/2258.804/2337.968ms, median TBT is 69ms and CLS is 0. The unchanged
responsible-entry age text remains the LCP node. Product has a 98 Performance
median, 2190.923ms LCP and 0ms median TBT; Find has a 99 Performance median,
1961.197ms LCP and 0ms median TBT. Accessibility, best practices and SEO are 100
in all nine audits.

The preserved baseline home median is 3472.275ms with Performance median 91;
the candidate median is 2337.968ms with Performance median 98, and all three
candidate runs pass the unchanged LCP threshold. The changed priority events and
repeated result support the bounded discovery hypothesis. They do not prove INP,
frame-rate, physical-device or complete-journey performance. The parser-blocking
history boundary, font strategy and primary Hero request remain untouched.

No dependency, endpoint, storage, cookie, secret, personal data, CSP relaxation,
inline script or external origin is introduced. Existing asset and provenance
checks remain mandatory.

The 47-page build, budgets, content, provenance, licenses, 617-component SBOM and
high-severity dependency audit pass. Canonical Lighthouse passes on audit entry
SHA-256
`377c5c4ef5e93d4a304bceed2de84b11a07898814da5d6f03c04d90ed196f6a5`.
Residual callbacks confirm that the remaining failure is broader: Footer is
24.670/23.119/23.211ms with 11 style updates and five layouts; a Product-labelled
boundary is 29.658/26.178/19.955ms, although that label does not prove exact
feature ownership; and Manifesto breaches once at
16.846/14.113/14.355ms. Material passes at 2.775/4.081/7.154ms and Culture at
8.839/13.570/9.853ms.

### 5. Maintainability and release safety

Service timings live in one named spec consumed by native and GSAP paths. The
plan, boundary and owner have focused unit coverage; source contracts protect the
primary and targeted lazy-image attributes. Diagnostics retain a stable scene id
and native effect prefix.

The rollback boundaries are narrow: Service may return to its verified GSAP
fallback without changing component markup, while the two `fetchpriority`
attributes can be reverted without changing sources, sizes or loading mode. A
single immutable artifact prevents mixing evidence from different candidates.

The frozen entry-document SHA-256 is
`184868e03ac73b881af12367bcfb5122403f6f78d1a150f1618afdd1cea36668`.
All 36 combined functional cases pass with exit 0 and no retries or skips: 12
extended native-home cases covering all four native scenes, plus 24 entry-paint
cases across Chrome, Firefox and WebKit, Full/Lite, 390/1440px, pause, Reduced,
exact style cleanup, entry reload, route/back navigation, no-JS and locale.
Main/Pages, complete-journey, Footer, physical-device and release gates remain
held.

## Acceptance ledger

| Gate                             | Required evidence                                      | Current status                                                   |
| -------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
| Source and artifact quality      | Full quality/build/audit on one artifact               | Pass: 344 strict files, 449 units, 47 pages, audit 0             |
| Service plan and ownership       | Focused units plus strict types/lint                   | Pass in combined source gate                                     |
| Controlled parity                | Chrome/Firefox/WebKit, Full/Lite, 390/1440px           | Pass: 12 pairs, 24 captures, unchanged budgets                   |
| Lifecycle                        | Natural finish, cancellation, reload and exact cleanup | Pass: controlled cleanup 24/24 plus combined functional coverage |
| Service hardware performance     | Three CPU×4 runs, `<16ms`, zero nested style/layout    | Pass: 10.005/9.007/11.388ms; zero nested work                    |
| Discovery hypothesis             | Nine Lighthouse runs plus raw promotion counts         | Pass: home LCP 2340.865/2258.804/2337.968ms; promotions 0/0/0    |
| Functional regression            | Native-home and entry-paint matrices                   | Pass: 36/36, exit 0, no retries/skips                            |
| Independent Footer/whole journey | Existing unchanged gates                               | Open                                                             |

See [ADR-0014](../decisions/ADR-0014-native-service-and-discovery-priority.md)
for the decision and rejected alternatives. Results must be added only after the
corresponding terminal evidence exists.
