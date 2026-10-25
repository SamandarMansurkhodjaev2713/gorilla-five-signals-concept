# Direct startup scheduling five-lens review — 2026-10-25

Status: source/unit, functional and canonical Lighthouse gates pass; hardware,
physical Safari and publication gates remain open.

## Scope and rationale

The candidate removes only the two redundant outer two-frame wrappers around
motion-runtime and confirmed-controller launch. Product explorer/archive still
mount synchronously after legal confirmation. Confirmed controllers and the
motion engine now enter their existing asynchronous chains directly through one
shared rejection guard.

This does not collapse authored scene staging. `loadAndMountMotionRuntime`
retains one frame before the engine import and one frame after it. Immediate
scene mounting retains its owned frame boundary and waits for each scene's real
`ready` promise. Full Hero retains 16 target stages, one pointer-depth stage and
one final apply/play/ready stage: all 18 still run through the one-stage-per-frame
owned queue.

## Five-lens review

### 1. Correctness and lifecycle

Both direct launch paths attach `.catch` synchronously through `launchAsync`, so
an escaping rejection is diagnosed rather than becoming fire-and-forget. The
typed diagnostic carries either `engine-load-failed` or
`controller-mount-failed` and preserves an `Error` message with a bounded
fallback for unknown values.

Generation ownership is unchanged. Functional controllers check `mounted` and
the active generation before and after their dynamic import. Runtime creation
passes through `mountMotionRuntime`, which rejects stale generations, duplicate
runtime ownership and post-destroy completion. `destroy()` still advances the
generation before releasing owned controllers, so a superseded asynchronous
chain cannot install into the next document.

No scheduler writes readiness. Runtime readiness still comes from the runtime's
scene lifecycle; `nextRuntime.ready` remains observed only for diagnostics.
Removing outer scheduling delay therefore does not mark an incomplete runtime
ready or move failure outside the readiness contract.

### 2. Architecture and boundaries

Scheduling policy remains in `motion-runtime.ts`; scene staging, engine loading,
registry ownership and Hero choreography remain in their existing modules. The
new helper centralizes only the repeated promise-rejection boundary and imports
the public diagnostic-code type. It does not know feature selectors, scene
definitions or GSAP/native implementation details.

The direct paths preserve their distinct responsibilities: confirmed entry
starts product controllers before the asynchronous confirmed-controller chain,
while intent/static activation starts only the runtime chain. No new global,
timer, listener, dependency, configuration or cross-layer import is introduced.

### 3. UX, accessibility and responsive behavior

The candidate changes when startup work is requested, not what is rendered.
Legal entry, focus, menu, locale, Reduced motion, no-JS visibility, Full/Lite
choreography, responsive selectors and content remain unchanged. The two inner
paint opportunities and all 18 Full Hero frame stages remain, preventing the
optimization from collapsing the authored boot into one long synchronous task.

The current unchanged-timeout functional matrix passes 51/51 in 3.1 minutes
with two workers, a 45s test timeout and 7.5s assertion timeout. It covers all
five identities that failed in the preceding 46/51 candidate and restored-grid
runs, plus three engines, phone/desktop, entry locale and FAQ disclosure
geometry. The previous 46/51 results remain historical evidence; this pass does
not reclassify them or establish physical Safari compatibility.

### 4. Performance, reliability and security

The intervention removes four outer RAF waits across the two launch functions,
without weakening inner paint or readiness gates. One startup observer records
ready/full at 4903/4890ms versus the preserved 6377/6311ms baseline, and loading
at 693/713ms versus 2218/2138ms. It records no errors. The retained 18-stage
navigation-to-Hero chain measures 3702/3677ms versus 3643/3643ms, so no
stage-chain acceleration is claimed. One observation is directional diagnostic
evidence, not stability, Lighthouse or hardware proof.

The fresh canonical batch passes all nine Lighthouse audits with no failures.
Home median Performance is 98, LCP 2338.9322ms, TBT 58ms and CLS 0. Product
median Performance is 98, LCP 2191.65465ms, TBT 0 and CLS 0. Find median
Performance is 99, LCP 1960.2672ms, TBT 0 and CLS 0. Accessibility, best
practices and SEO are 100 in every run. Audit build SHA-256 is
`5a7da20c75465d857d0606a127b5e5cdc1aaf7addeeedb846ed3192d2732db53`,
distinct from the local candidate SHA below.

The global hardware CPU×4 `<16ms` callback gate remains unchanged and open.
Complete-frame and startup-delivery evidence must show that work is neither
coalesced into a larger long frame nor hidden outside the observation window.
Physical Safari signoff also remains open.

No request, endpoint, secret, storage, cookie, CSP, authorization or personal
data path changes. Reliability risk is bounded to startup ordering and stale
completion, which the retained generation guards and cleanup ownership address
at source level but still require browser verification.

### 5. Maintainability and release safety

The source contract asserts that both outer schedulers contain no RAF, that
sync product mounts precede the guarded confirmed-controller launch, that the
loader retains exactly two ordered inner frame awaits around the dynamic import,
and that schedulers do not publish readiness. It also asserts the diagnostic
codes used by each direct path.

The rollback is localized: restore the two outer frame pairs and remove the
shared launch helper/source contract. No data migration or compatibility shim
is needed. Main/Pages must remain held until the evidence ledger below is
terminal.

## Pending evidence ledger

| Gate                | Required evidence                                                     | Status                                                                       |
| ------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Source quality      | Typecheck, units, audit and SBOM                                      | Pass: 0 TS errors, 358 strict files, 56 files / 467 tests, audit 0, SBOM 617 |
| Scheduling contract | Focused source tests for ordering, guards and readiness               | Pass in the current unit batch                                               |
| Functional startup  | Three engines across legal entry, route/reload and modes              | Pass: 51/51 in 3.1m; same two workers and unchanged timeouts                 |
| Startup observation | Scheduling/delivery plus runtime and scene states, unchanged timeouts | One error-free observation; stability not established                        |
| Hardware CPU×4      | Global callback gate `<16ms`; no displaced long-frame work            | Open                                                                         |
| Lighthouse          | Canonical repeated home/product/find batch                            | Pass: nine audits and zero failures; medians recorded above                  |
| Physical Safari     | Startup, lifecycle and visual signoff                                 | Open                                                                         |
| Main/Pages          | User-authorized publication after all required gates                  | Held                                                                         |

No pending row may be converted to pass from source inspection alone.

Candidate entry SHA-256:
`5b99c8bddaf9dd06adddc1040ae8c515d9263e32151c8f9aa0a0ccd19a7570bb`.
Source evidence: `.tmp/quality-startup-direct-2026-10-25.log`.
Functional evidence: `.tmp/startup-direct-functional-2026-10-25.log`.
Lighthouse evidence: `test-results/lighthouse/summary.json` and
`.tmp/startup-direct-lighthouse-2026-10-25.log`.
