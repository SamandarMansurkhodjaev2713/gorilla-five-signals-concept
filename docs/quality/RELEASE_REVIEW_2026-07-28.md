# Release review — 2026-07-28

> Historical release record. It does not prove the current redesign; use
> `RELEASE_REVIEW_2026-08-10.md` and `QA_STATUS.md` for current evidence.

This is the required five-pass Reflexion record. Each pass starts from a
concrete failure hypothesis, records the correction, and cites executed
evidence. “Looks polished” is never accepted as proof.

## Pass 1 — correctness, product truth, and semantic fallback

**Critique.** A visually impressive homepage could still publish contradictory
nutrition, fake live availability, dead locale routes, or content that
disappears without JavaScript.

**Improvement.** The experience is generated from validated localized records;
only five verified identities and conservative editorial copy render.
Contradictory nutrition and unverified retailer data stay quarantined. The
locator is an honest third-party search handoff. Native HTML carries navigation,
warning, product truth, compare content, details, and links.

**Evidence.** The build emits 47 pages. Content-integrity and internal-link
verifiers pass. Chromium covers all required routes/locales, a custom 404,
metadata, one `h1`, duplicate IDs, placeholder links, locale alternates, and a
JavaScript-disabled product journey.

## Pass 2 — architecture, races, and lifecycle ownership

**Critique.** Route changes during dynamic GSAP loading, rapid product input,
observers, media listeners, and repeated resize can mount obsolete scenes or
leak resources.

**Improvement.** The runtime uses a generation token, last-intent-wins
selection, one scene registry, scoped queries, AbortSignal listeners, owned
observers/RAF/context, reverse cleanup, stale-import rejection, and aggregated
cleanup failures. Reduced mode does not load GSAP.

**Evidence.** Thirty-four unit tests include cleanup, registry, preference,
schema, and edge paths. Browser tests run twenty navigation/resize cycles,
assert unique scene identity, verify pause persistence and reduced motion, and
collect console/page failures. Coverage is 97.77% statements, 91.66% branches,
and 100% functions.

## Pass 3 — mobile, visual system, and accessibility

**Critique.** Desktop choreography collapsed to a phone would create horizontal
overflow, hidden flavors, touch-only traps, undersized controls, and
unreadable motion-heavy layouts.

**Improvement.** Mobile has its own vertical five-card narrative, compact type
scale, finite Lite motion, safe-area behavior, complete visible content, and
semantic controls. Selection is never color-only. Critical controls target at
least 44 px. Server HTML starts in a readable end state.

**Evidence.** Six reviewed Chromium baselines cover 360, 390, 768, 1024
landscape, 1440, and 1920 px. Automated checks cover 320 px overflow, keyboard
skip, focusable journeys, essential target size, every required route/locale
with axe WCAG 2.2 AA, no-JS, system reduced motion, and explicit pause. Firefox
passes its four applicable cross-engine smoke checks.

**Remaining honest boundary.** VoiceOver, TalkBack, NVDA, and a physical
thirty-minute device soak require external hardware and remain open.

## Pass 4 — performance, security, licenses, and provenance

**Critique.** Awards motion can hide an oversized first view, unstable fonts,
eager media, supply-chain risk, missing security headers, or unreviewed package
licenses.

**Improvement.** The site stays static-first; GSAP loads on demand; motion uses
finite transform/opacity work; images have responsive derivatives; below-fold
content is lazy; locale fonts are deterministically subset and local. The Sites
worker applies CSP, transport, framing, permissions, referrer, content-type,
redirect, and cache policies. A deterministic SBOM fails on unknown licenses.

**Evidence.** Median-of-three Lighthouse is 99–100 across all categories on
three routes; worst LCP is 2.113 s, worst CLS 0.0192, and TBT 0 ms. Budget,
font, provenance, and security audit verifiers pass. CycloneDX 1.6 contains 819
reviewed dependency components. The only legacy license metadata override,
`parse-cache-control@1.0.1`, is grounded in its shipped BSD three-clause text
and documented in third-party notices.

## Pass 5 — release integrity, rollback, and documentation

**Critique.** A clean local build is not a release if canonical URLs are wrong,
source and artifact diverge, deployment mutates after review, rollback is
fictional, or documentation still describes an unfinished foundation.

**Improvement.** The repository defines one exact-origin Sites build, verifies
the worker contract, packages only the committed artifact, binds saved versions
to commit SHA, and deploys the immutable version privately. README, ADRs,
current QA status, SBOM, rights, checklist, board, and rollback runbook now
match the implemented system. Public visibility is treated as a separate
approval and build mode.

**Evidence.** `build:sites` and `verify:sites` exercise root redirect, headers,
cache, and asset binding. Deployment/version status and post-deploy smoke are
recorded in the final handoff. The runbook refuses to invent a rollback
rehearsal before two retained versions exist and refuses to claim a 72-hour
monitoring window before public promotion.

## Verdict

The implementation is suitable for an immutable private production review
candidate. Automated product, visual, responsive, motion, accessibility,
performance, security, provenance, and architecture evidence is strong. It is
not labeled a completed public launch until the named manual assistive
technology, physical-device, WebKit/CI, legal screenshot, rollback rehearsal,
and monitoring evidence exists.

## Post-deploy correction

The first version-2 production log exposed one automatic request for
`/favicon.ico` returning 404 while the document correctly declared
`/favicon.svg`. The worker now redirects the legacy path to the SVG, applies
security headers to redirects as well as assets, and explicitly emits HSTS.
`verify:sites` covers both redirects, CSP, HSTS, page caching, immutable asset
caching, and asset binding before a version can be saved.
