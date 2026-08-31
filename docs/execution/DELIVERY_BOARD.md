# Delivery board

- Objective: complete and release the approved Gorilla Uzbekistan product experience
- Started: 2026-07-26
- Last updated: 2026-08-31
- Source of truth: `docs/product/GORILLA_MASTER_PLAN.md`

Statuses: `[ ]` pending, `[~]` active, `[x]` evidence-complete, `[!]`
environment/external evidence blocked.

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
- [x] Contrast, forced-colors, reduced-motion, and mobile compositions verified.

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
- [x] Full/Lite/Reduced modes, persistent pause, proximity mounting, and deterministic teardown verified.
- [x] Mobile choreography and fifteen responsive/page-lead visual baselines approved locally.
- [!] Real-device thirty-minute thermal/memory trace requires physical hardware.

## M9 — hardening

- [x] Format, lint, strict types, unit coverage, build, links, content, provenance, budgets, audit, and SBOM pass.
- [x] Chromium journeys, axe, no-JS, keyboard, motion, and lifecycle checks pass.
- [x] Firefox applicable smoke checks pass.
- [x] Firefox and WebKit applicable cross-engine suites pass locally.
- [x] Eleven-view homepage and four-view page-lead visual matrix passes.
- [x] Lighthouse median-of-three exceeds every numeric release target.
- [x] Three CPU ×4 product journeys pass the 16 ms frame-work, 50 ms long-task, and 200 ms interaction gates.
- [x] Security/cache/redirect worker contract passes.
- [x] Five-pass critique and corrective review is recorded.
- [!] NVDA, VoiceOver, TalkBack, and physical-device sessions require external/manual evidence.

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
- [~] The Awwwards rebuild is active on `codex/awwwards-rebuild`; homepage and
  global-motion milestones pass current source and Chromium gates, while
  Product Atlas, Compare, and detail-world art direction remain open.
- [!] Seventy-two-hour monitoring starts only after a future public promotion.

## Operating rule

A checkbox becomes `[x]` only when named evidence covers its full scope.
External/manual gates stay visible and cannot be closed by inference.
