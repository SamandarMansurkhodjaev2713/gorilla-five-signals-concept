# Release checklist

- Audited browser candidate: `beebfd7`; lifecycle/capture refinements are the next candidate on `codex/awwwards-rebuild`, not the live Pages artifact
- Updated: 2026-10-14
- Rule: `[x]` means current evidence exists; `[ ]` is unfinished; `[!]` requires external/manual evidence

The live Pages build is a historical public review baseline. Source quality for
the refinement passes (115 unit tests and a 47-page build), but the completed
786-case browser attempt has seven failures. The expanded inventory has 861 cases.
Neither
old runtime results nor regenerated snapshots certify the final candidate. The
last Lighthouse artifact predates this candidate and must be measured again.

## Artifact and provenance

- [x] Frozen install is defined by the pnpm lockfile and pinned engines.
- [x] Format, lint, strict typecheck, unit coverage, build, verifiers, and audit pass.
      Current source evidence: 219 checked files with zero errors/warnings/hints,
      111 unit tests, 47 pages, and no known dependency vulnerabilities.
- [x] Every shipped brand, media, and font checksum matches the provenance ledger.
- [x] Published facts resolve to approved Uzbekistan source records; contradictory or unverified facts are omitted.
- [x] Local research, source masters, secrets, private legal files, source maps, and generated reports are excluded.
- [x] CycloneDX 1.6 SBOM and dependency license policy pass for 617 components.
- [x] Original project rights and third-party notices are documented.
- [x] Public baseline source commit, Pages workflow run, and deployment URL are
      recorded after successful deployment.
- [ ] Final Awwwards rebuild source commit and deployment evidence are recorded.

## Product and experience

- [x] All five products are distinct by name, marker, palette, composition, motion signature, and packshot.
- [ ] Complete current browser verification of selection, comparison, locator intent, FAQ, contact, culture, and legal outcomes; implementations and focused evidence exist.
- [x] Uzbek, Russian, and English route/content parity passes.
- [ ] Current complete no-JS gate preserves navigation, product truth, warning, comparison, and calls to action; focused evidence exists, full matrix remains open.
- [ ] Eleven homepage viewports and four page-lead visual baselines pass normal regression on the final candidate; 15-case regeneration is recorded separately, not as acceptance.
- [ ] Compact widths from 320 through 430 px, tablet, two landscape states, desktop, and wide desktop pass current full overflow/readability checks.
- [ ] Final chapter-boundary, five-detail-world desktop/mobile, menu/entry/footer, route-transition, error/404, and mode/fallback captures are reviewed and catalogued; desktop/mobile scroll recordings are included.
- [!] Physical 360 × 800 and 390 × 844 approval requires a device session.

## Accessibility and motion

- [ ] Current Chromium axe reports zero WCAG 2.2 AA violations on the required route/locale matrix.
- [ ] Current skip link, focus order, modal/inert behavior, disclosures, locale, and motion controls pass complete automation; targeted focus corrections pass locally.
- [ ] Current 200% text, text spacing, forced colors, 320 px reflow, reduced motion, data saver, and persistent user preference remain usable.
- [ ] Current repeated navigation/resize retains deterministic scene ownership and cleanup.
- [ ] Current Chromium, Firefox, and WebKit applicable suites pass; document every intentional skip. Historical cross-engine passes do not close this item.
- [ ] Current CPU ×4 motion journey passes three consecutive sessions with unchanged hard frame budgets.
- [!] NVDA, VoiceOver, and TalkBack evidence requires manual sessions.
- [!] Thirty-minute physical-device endurance evidence requires real hardware.

## Performance and security

- [ ] Final production Lighthouse median-of-three passes every route/category ≥95, LCP ≤2.5 s, CLS ≤0.1, mobile TBT ≤150 ms, and INP proxy/event timing ≤200 ms.
- [ ] Final performance evidence records the exact candidate and artifact hash. Prior artifact only: homepage 96/100/100/100, LCP 2,499.03 ms, CLS 0, TBT 99 ms; original detail 99/100/100/100, LCP 2,109.90 ms, CLS 0, TBT 8.5 ms; locator 99/100/100/100, LCP 1,888.69 ms, CLS 0, TBT 3.5 ms. Homepage LCP headroom is minimal; no threshold is relaxed.
- [ ] Current application frame work and LoAF blocking stay at or below 16 ms; no measured long task exceeds 50 ms.
- [x] Initial JavaScript, critical transfer, font, and responsive-image budgets pass.
- [x] Media source structure is responsive and poster/fallback-first.
- [ ] Current runtime verifies no below-fold film request before proximity/intent, finite playback, pause/visibility ownership, and usable media-failure fallback.
- [x] Dependency audit reports no known vulnerabilities on 2026-10-14;
      SBOM/license verification passes.
- [x] Document-level CSP and referrer fallbacks are present; response-level
      policies are explicitly recorded as GitHub Pages platform responsibilities.
- [ ] Final deployed CSP/fallback behavior, redirects, 404, media/cache policies, and platform limitations are measured on Pages separately from the worker contract.
- [x] No secret, PII telemetry, production console output, or unbounded client operation is present.

## Legal and brand

- [x] Project-level permission record is current.
- [x] Item-level brand, media, font, claim, and warning evidence is recorded.
- [x] No consumption, minor targeting, athlete-success, medical, stock, or product-effect claim is published.
- [x] The experience labels itself as an independent concept and does not imply commission or operation.
- [!] Final independently shareable screenshot approval remains owner/legal controlled.

## Deployment and rollback

- [x] The project base path is validated and applied through one URL helper.
- [x] Commit and push the validated public baseline with a clean public history.
- [x] Wait for the baseline immutable Pages workflow to complete successfully.
- [x] Run baseline post-deploy route, asset, locale, responsible-entry, metadata,
      keyboard, reduced-motion, and console smoke checks.
- [ ] Merge and deploy the exact final Awwwards rebuild commit after its full
      route, cross-browser, visual, performance, and legal gates pass.
- [ ] Record source SHA, artifact checksum, workflow run, deployment URL, and final smoke; promote the same artifact without rebuilding between approval and promotion.
- [ ] Final live smoke covers root/base redirects, three locales, homepage, five products, comparison, locator, FAQ, contact, legal, 404, media, menu, preferences, metadata, canonical/hreflang/sitemap/robots, console, and asset caching.
- [ ] Document and exercise rollback to a recorded previous immutable artifact where the platform permits.
- [!] The 72-hour monitoring window starts only after the concept is presented
  as portfolio-final; the current public artifact is explicitly a review build.
- [ ] Record the 72-hour owner/incident path and observation outcome, then provide the current portfolio case study and complete source/build/architecture/provenance/motion/report/release/rollback handoff.
- [ ] Record representative live field p75 LCP ≤2.5 s, INP ≤200 ms, and CLS ≤0.1 when sufficient observations exist; never label Lighthouse/proxy results as field evidence.
