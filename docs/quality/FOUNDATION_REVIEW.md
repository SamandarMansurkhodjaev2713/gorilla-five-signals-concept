# Foundation implementation review

> Historical foundation record. Current release evidence is maintained in
> `QA_STATUS.md` and `RELEASE_REVIEW_2026-08-10.md`.

- Scope: static Astro application, validated content, media/font pipeline,
  verification, CI, and Sites adapter
- Started: 2026-07-26
- Re-verified: 2026-07-28
- Status: implementation and automated foundation gates complete

## Acceptance result

- Node.js, pnpm, Astro, TypeScript, and direct dependencies are pinned.
- Astro emits a static, no-framework-runtime, no-WebGL product experience.
- Public environment values and content records are runtime validated.
- Forty-seven localized/support/legal/404 pages are generated.
- Critical navigation and product truth survive JavaScript failure.
- Motion has capability-aware tiers and deterministic ownership/teardown.
- Media, fonts, claims, links, budgets, provenance, licenses, and dependencies
  have executable verifiers.
- GitHub Actions defines frozen quality, three-browser, and median Lighthouse
  jobs with pinned actions.
- Sites output has a minimal verified worker for redirect, headers, caching, and
  asset binding.

## Six critique-to-improvement passes

1. **Toolchain correctness.** TypeScript/pnpm peer and install-policy
   incompatibilities were resolved with supported pinned versions, pnpm 11
   `allowBuilds`, and frozen-lockfile enforcement.
2. **Boundary correctness.** Undeclared transitive Vite access and schema-only
   reference checks were replaced by owned environment parsing and cross-record
   content verification.
3. **Progressive UX.** A hard-coded indexing state was replaced by validated
   private/public policy; semantic content, skip navigation, warnings, and
   actions remain independent of JavaScript.
4. **Supply chain and performance.** Build scripts are allowlisted; initial
   transfer, JavaScript, responsive media, font, provenance, audit, license, and
   SBOM gates are executable.
5. **Maintainability.** Nested commands use pinned Corepack, documentation
   reflects real commands, and the Cloudflare/Sites boundary is isolated in two
   focused scripts.
6. **Failure behavior.** Link traversal, stale SBOM, unknown license, missing
   media, stale font checksum, invalid content, and stale worker contract fail
   loudly rather than being ignored.

## Current verification ledger

| Gate | Result |
|---|---|
| Formatting and lint | Passed; zero warnings |
| Strict Astro/TypeScript | Passed; zero errors, warnings, or hints |
| Unit coverage | 34 tests; 97.77% statements; 91.66% branches; 100% functions |
| Static build | 47 pages |
| Links/content/budgets | Passed |
| Fonts/media provenance | Passed with deterministic checksums |
| Dependency audit | No known high-severity vulnerabilities |
| CycloneDX/license gate | Passed for 819 components |
| Chromium responsive/a11y/motion | Passed |
| Responsive visuals | Six baselines passed |
| Lighthouse medians | 99–100 categories; worst LCP 2.113 s; TBT 0 ms |
| Sites worker contract | Redirect, headers, caching, and assets passed |

Manual assistive-technology, physical-device endurance, local WebKit, and
public monitoring evidence are tracked separately in `QA_STATUS.md`.
