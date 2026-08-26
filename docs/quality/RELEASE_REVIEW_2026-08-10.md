# Release review — 2026-08-10

This is the current five-lens review required by `AGENTS.md`. It supersedes the
2026-07-28 release conclusions for the redesigned experience; historical
records remain useful only for provenance.

## 1. Correctness and edge cases

**Critique.** The redesign added stateful compare/product selection, an adult
context entry, route restoration, deferred rendering, media proximity, and
three motion capabilities. Correct rendering alone would not prove last-intent
wins, null/query handling, no-JS continuity, history restoration, or teardown.

**Improvement.** External content and environment boundaries remain
runtime-validated. Compare and product selection use explicit state machines
and canonical query parsing. Responsible entry, menu, media, and scene
controllers own deterministic cleanup. No-JS routes keep product truth and real
actions. Visual capture now exposes deferred scenes before comparison instead
of approving intrinsic-size placeholders.

**Evidence.** 80 unit tests pass with 100% statements/lines/functions and
97.27% branches. Chromium functional tests pass 98/98. Route inventory builds
47 pages, all internal links pass, and 36 content records validate.

## 2. Architecture, coupling, and cleanup

**Critique.** Rich motion could regress into global selectors, one god
timeline, leaked observers/listeners, or feature-owned `killAll()` behavior.
Large route-specific art direction could also collapse into duplicated page
logic.

**Improvement.** Semantic content, feature UI, motion setup, runtime
coordination, and infrastructure remain separate. Scenes receive one root,
AbortSignal, local queries, GSAP context, observer ownership, and idempotent
cleanup. Hero scroll choreography moved from `ScrollTrigger` to a native named
view timeline; JavaScript retains only finite entrance and pointer intent.
Feature folders own Compare, Products, FAQ, Culture, Contact, Locator, and
Product Explorer behavior.

**Evidence.** ESLint passes with zero warnings; Astro checks 134 files with no
errors, warnings, or hints. Repeated navigation/resize, route swaps, rapid
selection, media release, and race scenarios pass. No feature calls
`ScrollTrigger.killAll()`.

## 3. UX, responsive behavior, accessibility, and reduced motion

**Critique.** The earlier implementation was visually uneven: strong hero but
template-like inner routes, raw mobile rails, repeated reveal motion, and copy
hierarchy that could become unreadable. A desktop-only award composition would
not satisfy the product goal.

**Improvement.** The homepage, products atlas, five distinct flavor-detail
worlds, comparison duel, FAQ, Culture, Find, and Contact now use one Signal /
Industrial Editorial language without reusing one page template. Mobile has a
separate composition. Full, Lite, Reduced, and static/no-JS states preserve the
same content and actions. Focus, inert background, target size, forced colors,
200% text, and motion preference are explicit contracts.

**Evidence.** Fifteen Chromium visual baselines pass at 320, 360, 390, 412,
430, phone landscape, tablet, landscape, 1366, 1440, 1920, and four page-lead
states. Axe WCAG 2.2 AA passes across the localized route matrix. Firefox passes
16/16 applicable tests and WebKit 15/15. Manual screen-reader and physical-device
approval remain external gates.

## 4. Performance, security, and dependency risk

**Critique.** Initial Lighthouse reports exposed real main-thread/layout cost;
the first performance harness also misattributed presentation delay as
application work. Below-fold `content-visibility` then made full-page screenshots
capture placeholders. Security overrides changed four package versions whose
licenses were absent from the reviewed SBOM policy.

**Improvement.** Below-fold scenes use measured intrinsic containment; hero and
manifesto scrub work moved to native view timelines; product and editorial
entrances use compositor transforms; product media is decoded before selection;
startup scenes are distributed across animation frames; the film poster prefers
WebP; large paint layers and per-can locator filters were removed. The performance gate now measures
script plus style/layout separately from render/presentation. Visual capture
forces real deferred content. Exact-version license rules were added only after
inspecting installed package metadata and LICENSE text, with fail-closed tests.

**Evidence.** Three CPU ×4 journeys pass long task ≤50 ms, application work
≤16 ms, LoAF blocking ≤16 ms, and interaction ≤200 ms. Lighthouse medians are
96/100/100/100 on the homepage and 100/100/100/100 on Original and Find; worst
median LCP is 2.339 s, CLS 0.03347, and TBT 141 ms. Initial JS is 3.377 KiB gzip
on the homepage and 5.740 KiB on Compare; all transfer budgets pass. Audit
reports no known vulnerabilities. The reviewed CycloneDX inventory contains
640 components.

## 5. Maintainability, documentation, and release readiness

**Critique.** July release documents contained stale counts, an obsolete WebKit
blocker, old performance values, and claims about a previous private version.
Keeping them as current evidence would be less reliable than having no report.

**Improvement.** QA status, test strategy, release checklist, delivery board,
motion metrics, approval status, and documentation routing distinguish the
then-current automated evidence from historical and manual gates. This report
is retained as historical evidence and is not a pass claim for the current
art-direction rebuild.

**Evidence.** Format, lint, typecheck, unit, build, link/content/budget/font/film/
provenance/SBOM verifiers, dependency audit, three-browser tests, visual
regression, performance journey, Lighthouse, Sites build, and Sites worker
verification all pass on 2026-08-10. A meta CSP and referrer fallback now protects
the static document path; HSTS, frame ancestry, and the remaining response-header
policy still depend on the hosting edge. Public promotion is still blocked by the
named manual legal, assistive-technology, physical-device, and monitoring
records; private owner-only review is technically ready.

## Verdict

The reviewed historical source reached a successful owner-only deployment;
seven authorized routes, six representative assets, localized semantics,
responsible information, meta policy, and the anonymous access gate passed its
post-deploy smoke. Private operational identifiers are intentionally excluded
from the public repository. No current-release claim is authorized by this
historical review.
