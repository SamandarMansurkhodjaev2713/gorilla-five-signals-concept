# Delivery board

- Objective: complete and release the approved Gorilla Uzbekistan product experience
- Started: 2026-07-26
- Last updated: 2026-10-14

Current refinement: legacy component removal and lifecycle decomposition pass
115 unit tests, strict types on 220 files, formatting, lint, the 47-page build,
artifact verification, and clean dependency audit. Browser beebfd7 evidence is
372 passed / 407 intentional skips / 7 failed; 861 cases are now individually
listed after capture/mode fixture decomposition. The WebKit Full-motion gate is
still open, not explained away by an environment assumption. A minimal native
RAF/CSS control is healthy; actual application mode comparisons are in progress.
- Current source candidate: `beebfd7` on `codex/awwwards-rebuild`
- Source of truth: `docs/product/GORILLA_MASTER_PLAN.md`

Statuses: `[ ]` pending, `[~]` active, `[x]` evidence-complete, `[!]`
environment/external evidence blocked.

## Current candidate evidence boundary

The implementation milestones below describe delivered work. Historical browser,
visual, performance, and deployment results do not certify this candidate. The
2026-10-14 source quality run passes: 219 checked files with zero errors, warnings,
or hints; 111 unit tests; 47 generated pages; content/link/media/budget checks;
617-component SBOM/license verification; and no known dependency vulnerabilities.
The parent-owned 786-test browser matrix is running; no final result is recorded
here. Its process handle is operational context, not durable release evidence.

The last Lighthouse series belongs to an earlier artifact, not `beebfd7`:
homepage 96/100/100/100, LCP 2,499.03 ms, CLS 0, TBT 99 ms; original detail
99/100/100/100, LCP 2,109.90 ms, CLS 0, TBT 8.5 ms; locator 99/100/100/100,
LCP 1,888.69 ms, CLS 0, TBT 3.5 ms. The homepage has little LCP headroom. Final
median-of-three and three consecutive CPU ×4 journeys remain pending without
changing any threshold. See `docs/quality/QA_STATUS.md` for dated evidence.

## M0 — authorization and product truth

- [x] Project permission basis recorded.
- [x] Five Uzbekistan product identities and localized names verified.
- [x] Claim/source truth table and responsible-use wording recorded.
- [x] Asset and font provenance ledger with checksums implemented.
- [x] Unverified nutrition, stock, and retailer claims quarantined.
- [x] Safe map-search and contact outcomes implemented.

## M1 — experience architecture

- [x] Route map, section jobs, and conversion paths defined.
- [x] Localized copy deck and scene-by-scene storyboard implemented.
- [x] Desktop and independent mobile narratives defined.
- [x] Full/Lite/Reduced/fallback motion map implemented.

## M2–M3 — art direction and design system

- [x] Signal / Industrial Editorial territory implemented.
- [x] Semantic color and five flavor themes implemented.
- [x] Locale-aware typography and deterministic font delivery verified.
- [x] Grid, spacing, material, control, focus, and z-index tokens implemented.
- [x] Contrast, forced-colors, reduced-motion, and mobile compositions implemented and historically verified; current full-matrix revalidation is tracked under M9.

## M4–M6 — foundation and semantic product

- [x] Runtimes and direct dependencies pinned; frozen lockfile committed.
- [x] Static Astro structure and Zod-validated content boundaries implemented.
- [x] Forty-seven pages across Uzbek, Russian, English, support, legal, and 404 generated.
- [x] Five products, comparison, locator handoff, FAQ, contact, legal, and culture journeys implemented.
- [x] Locale-preserving navigation, metadata, hreflang, sitemap, social card, and no-JS path verified.
- [x] CSP/security headers, budgets, provenance, unit, E2E, accessibility, visual, and Lighthouse harnesses implemented.

## M7–M8 — media and choreography

- [x] Approved packshots, responsive derivatives, logo derivatives, and original social artwork integrated.
- [x] Thirteen finite scene contracts implemented.
- [x] Product selection, lineup, compare, culture, locator, and footer choreography implemented.
- [x] Full/Lite/Reduced modes, persistent pause, proximity mounting, and deterministic teardown implemented and historically verified; current revalidation remains under M9.
- [x] Mobile choreography and fifteen responsive/page-lead visual baselines exist; current snapshot generation passed 15 cases, but generation is not final regression/device approval.
- [!] Real-device thirty-minute thermal/memory trace requires physical hardware.

## M9 — hardening

- [x] Format, lint, strict types, unit coverage, build, links, content, provenance, budgets, audit, and SBOM pass.
- [~] Current full Chromium/Firefox/WebKit matrix: 786 scheduled cases; applicable tests must pass and skips must have recorded reasons. Earlier passes are historical only.
- [~] Current axe, no-JS, keyboard, motion, lifecycle, 200% text, forced-colors, and reflow gates are included in the running matrix; focused corrections are not a full pass.
- [ ] Normal visual regression and authored frame review for the final candidate, including eleven homepage and four page-lead views. Snapshot regeneration alone does not close this gate.
- [ ] Final Lighthouse median-of-three: every category ≥95, LCP ≤2.5 s, CLS ≤0.1, mobile TBT ≤150 ms, and INP proxy/event timing ≤200 ms.
- [ ] Three consecutive current-candidate CPU ×4 product journeys: application frame work/LoAF blocking ≤16 ms, long tasks ≤50 ms, interactions ≤200 ms.
- [ ] Current security/cache/redirect worker contract and separate live Pages platform verification; historical worker results cannot certify Pages response headers.
- [x] Five-pass critique and corrective review is recorded.
- [!] NVDA, VoiceOver, TalkBack, and physical-device sessions require external/manual evidence.
- [ ] Final chapter-boundary and five-world desktop/mobile captures, desktop/mobile scroll recordings, Full/Lite/Reduced/static/no-JS representative frames, error/404 and route-transition evidence catalogued against the final source.

## M10–M11 — release

- [x] Release, rollback, operations, ownership, and maintenance documentation created.
- [x] Cloudflare Sites adapter and immutable packaging path verified.
- [x] A private review project and immutable deployment path exist.
- [x] A historical owner-only artifact was deployed and smoke-tested before the
      public repository was prepared.
- [!] Signed-in post-deploy application smoke may require owner authentication.
- [x] The project owner explicitly authorized public GitHub and Pages promotion
      on 2026-08-26.
- [x] The first Pages workflow completed and its public URL passed route, asset,
      locale, responsible-entry, metadata, and console smoke checks.
- [~] The Awwwards rebuild is active on `codex/awwwards-rebuild`; homepage,
  global motion, Product Atlas, Signal Duel, and five detail worlds pass the
  current source and focused Chromium gates. Full browser, Lighthouse,
  physical-device, and final visual/legal sign-off remain open.
- [!] Seventy-two-hour monitoring starts only after a future public promotion.
- [ ] Freeze the exact validated commit, record its artifact checksum, promote the same artifact, and record workflow/URL/live smoke without rebuilding between approval and promotion.
- [ ] Verify final live root/base redirects, all locales/routes, media, menu, preferences, metadata, canonical/hreflang/sitemap/robots, console, and caching.
- [ ] Exercise the documented rollback where the platform permits; record the previous immutable target.
- [!] Final independently shareable-frame and portfolio screenshot approval remains owner/legal controlled.
- [ ] Complete the final case-study/handoff package with current measurements, screenshots, clean-room account, architecture, provenance, motion map, limitations, and release/rollback evidence.
- [ ] Record representative live field p75 LCP ≤2.5 s, INP ≤200 ms, and CLS ≤0.1 when sufficient observations exist; lab/proxy measurements are not field evidence.

## Five-lens evidence synchronization — 2026-10-14

1. Correctness: distinguish source verification, snapshot generation, focused tests,
   and the running full matrix; no running job is recorded as passed.
2. Architecture/lifecycle: retain current-candidate teardown/stress and throttled
   journey requirements; historical runtime evidence is insufficient after changes.
3. UX/accessibility: preserve complete viewport/mode/locale, authored-frame, real
   device, and assistive-technology gates rather than equating automation with approval.
4. Performance/security: retain original numeric budgets, record narrow prior LCP
   margin, and separate source audit/worker policy from deployed Pages behavior.
5. Maintenance/release: bind final evidence to source/artifact/workflow and retain
   legal, rollback, 72-hour observation, and portfolio-handoff requirements.

## Operating rule

A checkbox becomes `[x]` only when named evidence covers its full scope.
External/manual gates stay visible and cannot be closed by inference.
