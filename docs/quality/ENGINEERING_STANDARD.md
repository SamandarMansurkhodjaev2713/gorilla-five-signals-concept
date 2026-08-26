# Engineering standard and quality gate

Apply every relevant item before merging or releasing. Mark non-applicable items `N/A` with a written reason; absence of a backend does not permit silently deleting backend gates.

## Correctness

- [ ] **C-01** Null, undefined, empty, maximum, minimum, and zero cases are handled.
- [ ] **C-02** Concurrent actions and duplicate requests have defined behavior.
- [ ] **C-03** Subscriptions, timers, listeners, observers, media queries, and animation contexts are cleaned up.
- [ ] **C-04** Every loop, retry, and animation cycle has a guaranteed exit or lifecycle owner.
- [ ] **C-05** Numeric ranges are safe; money never uses floating point.
- [ ] **C-06** Domain and orchestration logic is not duplicated.
- [ ] **C-07** Side effects are isolated behind infrastructure or lifecycle boundaries.
- [ ] **C-08** Data is not mutated unexpectedly.

## Type safety

- [ ] **TS-01** No `any`, `object`, or unchecked escape hatch without `TYPE-EXCEPTION: <reason>`.
- [ ] **TS-02** Type assertions are backed by runtime checks where data is uncertain.
- [ ] **TS-03** External data and environment values pass schema validation.
- [ ] **TS-04** Variant states use discriminated unions.
- [ ] **TS-05** Nullable values are explicitly handled.

## Security

- [ ] **S-01** Query injection is impossible through parameterization and boundary validation.
- [ ] **S-02** User-controlled output cannot create XSS.
- [ ] **S-03** Row/resource authorization exists at the data boundary when protected data is introduced.
- [ ] **S-04** PII is absent from logs and analytics payloads.
- [ ] **S-05** Secrets are absent from source, configuration, fixtures, and client bundles.
- [ ] **S-06** State-changing server actions include CSRF protection when cookies are used.
- [ ] **S-07** Public endpoints have abuse and rate-limit controls.
- [ ] **S-08** New dependencies pass license, maintenance, provenance, bundle, and security review.
- [ ] **S-09** Security headers and CSP are verified in the deployed environment.

## Performance

- [ ] **P-01** N+1 access patterns are excluded when data access exists.
- [ ] **P-02** Query filters, ordering, and joins have suitable indexes when persistence exists.
- [ ] **P-03** List APIs paginate or bound results.
- [ ] **P-04** Independent operations run concurrently without creating resource contention.
- [ ] **P-05** New caches expose hit/miss behavior when caching exists.
- [ ] **P-06** Bundle and initial-transfer budgets pass.
- [ ] **P-07** LCP media has explicit priority, dimensions, and responsive sources.
- [ ] **P-08** Below-the-fold video has a poster and intent/proximity loading.
- [ ] **P-09** Motion avoids layout thrashing and unnecessary main-thread work.
- [ ] **P-10** Mobile Lighthouse and Core Web Vitals budgets pass repeatably.

## Reliability

- [ ] **R-01** Transient external failures use bounded retries with backoff where safe.
- [ ] **R-02** Every external call has a timeout and abort path.
- [ ] **R-03** Mutating external operations are idempotent or deduplicated.
- [ ] **R-04** Dependency failures degrade gracefully.
- [ ] **R-05** New critical external dependencies have circuit-breaking or an equivalent failure boundary.
- [ ] **R-06** Media and enhancement failures never hide core content or navigation.

## Tests

- [ ] **TST-01** Domain/application logic has unit tests.
- [ ] **TST-02** New adapters and integrations have integration tests.
- [ ] **TST-03** Edge cases are covered, not only happy paths.
- [ ] **TST-04** Test names express GIVEN/WHEN/THEN behavior.
- [ ] **TST-05** Tests do not depend on uncontrolled time, order, network, or animation.
- [ ] **TST-06** Fixtures use factories/builders instead of scattered hard-coded data.
- [ ] **TST-07** Critical journeys have Playwright coverage.
- [ ] **TST-08** Responsive visual regression covers the agreed viewport matrix.
- [ ] **TST-09** Keyboard, focus, and reduced-motion paths are tested.

## Code

- [ ] **CODE-01** Logic is not duplicated.
- [ ] **CODE-02** No dead exports, functions, types, styles, or assets remain.
- [ ] **CODE-03** No commented-out code remains.
- [ ] **CODE-04** Every `TODO`/`FIXME` references an issue.
- [ ] **CODE-05** Imports follow external → internal → types and project aliases.
- [ ] **CODE-06** Values with meaning are named tokens/constants.
- [ ] **CODE-07** Early returns prevent pyramid-shaped control flow.
- [ ] **CODE-08** No production `console.*`.
- [ ] **CODE-09** Async work is awaited or has an explicit rejection path.
- [ ] **CODE-10** Feature code cleans up only resources it owns.

## Documentation

- [ ] **DOC-01** Public APIs have useful doc comments where names/types are insufficient.
- [ ] **DOC-02** Complex business or motion decisions explain why, not what.
- [ ] **DOC-03** OpenAPI/AsyncAPI/Proto contracts change with their APIs.
- [ ] **DOC-04** README and commands match reality.
- [ ] **DOC-05** Architecture changes have ADRs.
- [ ] **DOC-06** Every production media asset has provenance and license metadata.
- [ ] **DOC-07** The repository license is selected and documented before the first public push.

## Compatibility and deployment

- [ ] **COMPAT-01** Backward compatibility is preserved or an ADR documents migration.
- [ ] **COMPAT-02** Database migrations are additive when feasible.
- [ ] **COMPAT-03** Migration rollback is written and verified when persistence exists.
- [ ] **COMPAT-04** High-risk behavior is guarded by a feature flag where rollback is otherwise slow.
- [ ] **COMPAT-05** New environment variables exist in `.env.example` and documentation.
- [ ] **COMPAT-06** Runtime and package-manager versions are pinned.
- [ ] **COMPAT-07** A committed lockfile makes installs reproducible.
- [ ] **COMPAT-08** Production headers, caching, redirects, and fallback behavior are verified.

## Observability

- [ ] **OBS-01** Important operations expose counters and duration distributions when a telemetry system exists.
- [ ] **OBS-02** Logs are structured and privacy-safe.
- [ ] **OBS-03** Operations over 50 ms have trace spans when tracing exists.
- [ ] **OBS-04** Web vitals and client errors are observable without collecting unnecessary personal data.

## UX, accessibility, and motion

- [ ] **UX-01** Mobile and desktop are separately art-directed.
- [ ] **UX-02** Content parity is preserved across breakpoints.
- [ ] **UX-03** Touch, keyboard, mouse, and screen-reader paths remain functional.
- [ ] **UX-04** Focus is visible, ordered, restored after overlays, and not obscured.
- [ ] **UX-05** Semantic landmarks and heading hierarchy are valid.
- [ ] **UX-06** Labels, names, alternatives, captions, and live-region behavior are correct.
- [ ] **UX-07** `prefers-reduced-motion` removes or reduces spatial motion without removing content.
- [ ] **UX-08** Autoplay/looping motion can be paused when WCAG requires it.
- [ ] **UX-09** Interactive targets satisfy WCAG 2.2 AA and aim for 44×44 CSS pixels.
- [ ] **UX-10** Layout passes at 200% zoom and the agreed viewport matrix.
- [ ] **UX-11** Motion has a narrative or feedback role and does not compete with reading.

## Universal forbidden patterns

- magic values;
- silent `catch` or ignored errors;
- secrets in code/config/tests;
- unbounded production queries or lists;
- external calls without timeout;
- copy-pasted logic;
- boolean mode parameters;
- god modules/functions;
- business logic in controllers/view components;
- domain imports from infrastructure;
- production `console.*`;
- commented-out code;
- untracked `TODO`/`FIXME`;
- exploratory reading without a concrete question;
- loading entire files when signatures or focused sections answer the question;
- floating point for money;
- direct unvalidated environment access;
- fire-and-forget async;
- global motion selectors;
- feature-level global cleanup;
- fake progress indicators;
- placeholder links or non-functional controls;
- eager loading of the complete media library.

## Five-pass release record

Before handoff, record the result of:

1. correctness/edge-case review;
2. architecture/lifecycle review;
3. UX/responsive/accessibility review;
4. performance/security/dependency review;
5. maintainability/documentation/release review.

Each pass must name evidence and corrective action, not merely say “passed.”
