# ADR-0006: Version-pinned native transition readiness ownership

- Status: accepted; scoped verification completed, full release acceptance pending
- Date: 2026-10-14
- Scope: maintenance candidate only; no merge or public deployment authorized by this ADR

## Evidence

Three real Compare-to-Contact navigation races on the unchanged maintenance
artifact (`/uz/` SHA256
`4dfe5d9be9416e1a2a5341d556acd7cbeb32ecad7bcc008d2d9cf5f05fe68ecf`)
produced `AbortError: Transition was skipped`. Passive promise identity recording
confirmed that every rejection belonged to the first native `ViewTransition.ready`,
not its update, finished, or derived finally promise. Latest Contact URL, heading
focus, and idle route signal remained correct. Ordinary immediate double clicks
did not reproduce this boundary because the first preparation was aborted before
any native transition existed. Neither experiment modified DOM-update callbacks,
advanced animation clocks, filtered global errors, or prevented rejection events.

The CSS View Transitions specification states that readiness can reject even when
its getter is never accessed. An explicitly skipped visual transition can still
perform its DOM update successfully. Official Astro 7.1.3 and 7.3.1 router source
texts are identical, so this is not evidence of an upgrade-introduced router change.

Sources:

- [CSS View Transitions Level 1](https://drafts.csswg.org/css-view-transitions-1/#skip-the-view-transition)
- [Astro 7.3.1 router](https://github.com/withastro/astro/blob/astro%407.3.1/packages/astro/src/transitions/router.ts)
- [Astro 7.1.3 router](https://github.com/withastro/astro/blob/astro%407.1.3/packages/astro/src/transitions/router.ts)

## Decision

Use pnpm's generated package-patch workflow for exactly `astro@7.3.1`.
`pnpm-workspace.yaml` names `patches/astro@7.3.1.patch`; the lockfile binds its
SHA256 `10d9fba95e33f9149aa1b4020aee86f199da90e6a20adb8ebfe2d5ce197efc81`.
The patch adds no package or external runtime request. Astro's upstream MIT license
remains applicable; the added helper and changes are repository-authored code.
The generated patch is the source of truth, not a manually edited node_modules tree.

The router acquires supersession ownership only after its prior native object's
`skipTransition()` returns successfully, then observes readiness immediately after
native creation. Promise reactions run in microtasks, so this synchronous ownership
assignment precedes rejection classification; a throwing skip cannot acquire ownership.
The original native object, callback, animation, preparation abort checks, history,
fallback path, script sequencing, and finished cleanup remain unchanged.

The small package-local helper returns a typed discriminated outcome:

- `ready`: native readiness fulfilled;
- `superseded`: a real DOMException AbortError followed an owned skip and the DOM
  update succeeded;
- `ready-failed`: DOM update succeeded but visual readiness failed unexpectedly;
- `update-failed`: DOM update failed; existing Astro router diagnostics retain ownership.

Only unexpected visual errors are sent to native `reportError` by the readiness
owner. Expected cancellation and delegated update failure emit the structured
`astro:transition-outcome` event with status/reason or diagnostic-owner fields.
These events contain no URL, product data, exception message, or stack. No global
error filter, artificial debounce, disabled ViewTransitions, or silent catch is added.

## Explicit limitation and follow-up

**ADR-0006-FOLLOWUP-01:** Astro's existing discarded `updateCallbackDone.finally`
and `finished.finally` chains can each reject after a callback failure. This patch
does not repair or deduplicate those pre-existing diagnostics. The readiness owner
must add **no additional** callback-error report. A separate causal investigation
and framework-owner error-policy decision are required before changing those chains.
This tracked follow-up is not a placeholder implementation or permission to hide errors.
The proven readiness failure is tracked in
[repository issue #18](https://github.com/SamandarMansurkhodjaev2713/gorilla-five-signals-concept/issues/18).

## Verification and removal

Unit contracts import the installed package-local helper rather than duplicating
its algorithm. They cover native identity preservation, success, owned skip before
readiness, waiting for the real DOM outcome, skip after readiness, unowned AbortError,
non-Abort visual error, fake AbortError name, delegated callback failure, and unchanged
exactly-once finished ownership. Source guards confirm the original finally chains remain.

Verified on 2026-10-14 after the successful-skip ownership correction:

- 14 installed-helper unit contracts passed; full unit suite 113/113 passed.
- Formatting and lint passed; typecheck examined 171 files with zero errors,
  warnings, or hints; production build emitted 47 pages.
- Frozen-lockfile installation passed; all artifact gates passed, including
  47-page links, transfer budgets, content, font hashes, asset provenance and the
  regenerated 617-component licensed SBOM. Dependency audit found no known
  vulnerabilities. The pinned host film-toolchain check passed.
- Three real native-start-boundary Compare-to-Contact repetitions passed. Each
  created two native transitions, performed one owned skip, emitted exactly one
  document cancellation outcome, preserved final URL/focus/idle, and produced
  no runtime error. No ready rejection handler was added by the passive diagnostic.
- Separate synthetic faults exercised the actual patched router: an unowned native
  skip reported AbortError exactly once and still updated the DOM; a failing native
  DOM callback emitted one delegated update outcome, added zero readiness error
  reports, and retained both pre-existing discarded-finally errors. These negative
  controls do not claim that the application is error-free or callback deduplication
  is repaired.

Guarded maintenance artifact HTML SHA256 values:

| Route | SHA256 |
| --- | --- |
| `/uz/` | `9591d569985221ba49a357bf765c80b7763bb64afcc974c0bc2aefc7bd058c8c` |
| `/en/` | `d63ace28e3478f7d9ab4e4472ae197211c5d20c8851695aa51413163b2f554cb` |
| `/ru/` | `d70c0861811fe91edb0006e0faa5cf468afd79098700737983bbbb567799a4e2` |

The feature-owner preview on port 4321 was not rebuilt or substituted. This record
does not supersede outstanding Lighthouse, font-metric, WebKit motion, visual, or
complete release-matrix failures. No public merge or deployment follows from these
scoped checks.

### Permanent navigation regression: phase-aware, not a timing promise

The permanent Chromium entry test triggers a second real Contact intent at first
native creation without modifying either native DOM callback. This boundary does
not guarantee rejected readiness: a warm renderer can fulfill readiness before the
second preparation reaches supersession. The initial exact-one-event test passed
three isolated runs but correctly failed once in the full entry suite with fulfilled
readiness and no cancellation event. That valid after-ready path must not be treated
as a framework defect or hidden by retries, longer timeouts, or forced callbacks.

The revised test records actual native readiness and successful skip ownership.
Rejected owned native AbortError requires exactly one document cancellation outcome;
fulfilled readiness requires exactly zero. Unexpected rejection, pending readiness,
absent transitions, unowned skip, malformed/duplicate outcomes, or unhandled promises
fail independently. Latest Contact URL/focus/idle and native history round trip are
required in either phase.

Heading focus is strict for the newer real anchor navigation. The history round trip
requires the correct Contact URL, visible heading and idle signal; it does not invent
a heading-focus requirement on browser history traversal. The existing route lifecycle
focuses headings only for recorded anchor intents and separately restores history scroll.

The test-only readiness observer handles the native promise to record its rejection.
It can suppress the original unhandled rejection if the production owner is removed;
therefore the structured cancellation assertion is essential, not optional. Pure
counter-fixtures prove that rejected readiness without that production event fails,
and that a bogus event after fulfilled readiness fails. Unexpected readiness failures
also fail the validator even if the test observer consumed the rejection. The dated
three passive before-ready browser results above and the 14 installed-helper unit
contracts remain separate critical-path evidence. The earlier exact-one full entry
suite was 9 passed / 1 timing-assumption failure, not a passing release milestone.

The revised test and counter-fixtures were verified on 2026-10-14 without rebuilding
the stable maintenance artifact listed above: scoped formatting/lint passed, strict
typecheck examined 174 files with no errors/warnings/hints, and all 125 unit tests
passed (including 12 phase-aware counter-fixtures and the 14 installed-helper
contracts). The new browser case passed three repetitions in 9.3 seconds; the full
Chromium entry spec passed 10/10 in 12.2 seconds with one worker and unchanged
timeouts/profile. JSON evidence attachments recorded rejected owned native AbortError
and exactly one cancellation in all four actual case executions; final Contact
readiness fulfilled. These runs do not claim actual fulfilled-first branch coverage:
that branch and invalid/missing ownership cases are covered by the pure fixtures.
Initial false failures from a new post-history heading-focus expectation were
corrected to the existing anchor-focus/history-scroll policy, not by forcing focus
or changing the application. The complete prior 119-case batch and broader browser,
visual, performance and release matrices have not been rerun by this test-only change.

The phase-aware navigation test does **not** guarantee that a real AbortError branch
is exercised on every run. If every observed first readiness fulfills, removing the
production readiness owner could still leave this navigation test passing. The pure
missing-event counter-fixture proves the validator's rejected-phase behavior, not
that the browser entered that phase. A phase-aware pass alone is therefore not
acceptance evidence for this framework patch. Retain the dated passive before-ready
reproduction and patched cancellation results, installed-helper contracts, and
actual-patched-router negative controls as separately scoped evidence. Revalidate
that critical path when the patch or framework version changes; do not manufacture
branch coverage with delays, native callback substitution, or required flaky timing.

The recorded negative router controls used explicitly synthetic native faults.
They prove that the patched readiness owner reports an unowned native abort once
and adds no callback-error report while preserving existing callback diagnostics.
They do not prove that every application failure path or route is covered, and do
not resolve the discarded-finally diagnostic duplication described above.

Release requires a clean frozen-lockfile install, source checks, full unit suite,
production build, coherent regenerated SBOM, and real lifecycle-boundary browser
repetitions. Browser negative controls must retain callback-error reporting; merely
passing an immediate double-click race is insufficient. Existing visual, mobile,
accessibility, performance, and feature checks still apply. Results belong in the
quality report; this ADR does not assert an all-green release.

Remove the patch only after an official Astro version owns native readiness with
equivalent unexpected-error behavior and passes these same contracts and browser
boundaries. Do not replay this patch blindly on another version. Review the pinned
patch digest and SBOM whenever the framework or dependency lock changes.

## Five review lenses

1. Correctness: classify only explicit native supersession after successful DOM
   update; unexpected and callback failures remain observable.
2. Architecture: framework owns its promise; no application monkeypatch or router
   DOM imports in Node unit tests. Original cleanup retains ownership.
3. UX: preserve authored native transitions, latest-request-wins, focus and history;
   cancellation never prevents the final DOM state.
4. Performance/security: no observer, timer, network request, dependency, global
   error filter, or exception payload is introduced by the patch.
5. Maintenance/release: exact version and generated patch digest, installed-code
   tests, SBOM regeneration, explicit limitation, and upstream removal condition.
