# QA status

- Snapshot date: 2026-08-31
- Technical verdict: **homepage/global-motion rebuild milestone passed; route art direction remains active**
- Deployment verdict: **public GitHub Pages review release is live; rebuild remains on a feature branch**
- Public sign-off verdict: **review build only; commercial-launch claim held**
- Evidence rule: code existence and historical reports are not current pass evidence

## Executed evidence

| Gate                              | Status                   | Current evidence                                                                                                                      |
| --------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Format, lint, strict types        | Passed locally           | Prettier; ESLint zero warnings; Astro Check on 182 files with zero errors, warnings, or hints                                         |
| Unit tests                        | Passed locally           | 100 tests in 15 files                                                                                                                 |
| Unit coverage                     | Passed locally           | 100% statements, lines, and functions; 97.31% branches                                                                                |
| Static build                      | Passed locally           | 47 localized/static pages                                                                                                             |
| Content, links, budgets           | Passed locally           | Links across all 47 HTML files; 38 validated content records; initial JS/transfer limits pass                                         |
| Media/font provenance             | Passed locally           | Ten media records; deterministic font subsets and checksums; pinned FFmpeg binary hash                                                |
| Dependency security               | Passed locally           | `pnpm audit --audit-level high`: no known vulnerabilities                                                                             |
| Dependency licenses/SBOM          | Passed locally           | Deterministic CycloneDX 1.6 inventory with 640 reviewed components                                                                    |
| Current rebuild Chromium contract | Passed locally           | 93 of 93 focused homepage, global-motion, lifecycle, media, responsive, touch, keyboard, and no-JS tests                              |
| Current authored capture journeys | Passed locally           | Fresh desktop and mobile chapter captures, two of two                                                                                 |
| Firefox                           | Historical baseline only | Must be rerun after Product Atlas/Compare/detail-world art direction settles                                                          |
| WebKit                            | Historical baseline only | Must be rerun after Product Atlas/Compare/detail-world art direction settles                                                          |
| Accessibility and reflow          | Passed locally           | Axe WCAG 2.2 AA route matrix, keyboard, focus, 200% text, forced colors, 320 px, and reduced motion                                   |
| Motion performance                | Passed locally           | Three independent CPU ×4 product journeys; long task ≤50 ms, application frame work ≤16 ms, LoAF blocking ≤16 ms, interaction ≤200 ms |
| Lighthouse median of three        | Historical baseline only | Last recorded medians were 96–100; rerun is required after the complete Awwwards rebuild                                              |
| Sites worker contract             | Passed locally           | Cloudflare-compatible artifact; redirect, headers, caching, and asset binding verified                                                |
| Public review release             | Passed                   | GitHub Pages baseline release, Quality, Pages, and CodeQL completed successfully before this feature milestone                        |

The current milestone's dated five-pass evidence and corrective actions are in
`docs/quality/AWWWARDS_REBUILD_REVIEW_2026-08-31.md`.

## Performance medians

| Route                    | Performance | Accessibility | Best practices | SEO |      LCP |     CLS |    TBT |
| ------------------------ | ----------: | ------------: | -------------: | --: | -------: | ------: | -----: |
| `/uz/`                   |          96 |           100 |            100 | 100 | 2,339 ms | 0.03347 | 141 ms |
| `/uz/products/original/` |         100 |           100 |            100 | 100 | 1,891 ms |       0 |  36 ms |
| `/uz/find/`              |         100 |           100 |            100 | 100 | 1,737 ms |       0 |  35 ms |

The runner built a dedicated artifact with entry SHA-256
`7129ed0ed7a5190539642cbc287ab9a536383504d775342a4461e3363899f5ca`,
executed exactly three reports per route, validated every JSON boundary, and
wrote the local evidence under `test-results/lighthouse/`. Reports are not
uploaded to a public result service.

## Manual evidence still required before a public launch claim

| Gate                       | Status                              | Required record                                                                       |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------- |
| Assistive technology       | Pending external device session     | Dated NVDA, VoiceOver, and TalkBack task results                                      |
| Physical-device endurance  | Pending external device session     | Thirty-minute mid-tier Android/iPhone thermal, battery, frame, and memory observation |
| Final legal screenshots    | Owner/legal controlled              | Approval for hero, product, locator, mobile, OG, and independently shareable frames   |
| Signed-in production smoke | Pending owner-authenticated session | Live locale, mobile menu, motion pause, metadata, media, and runtime-log check        |
| 72-hour monitoring         | Starts only after public promotion  | Named owner, incident channel, and observation record                                 |

These gates are not silently converted to “N/A.” They do not prevent an
owner-only portfolio review, but they prevent claiming a completed public
production launch.

The private Sites edge serves the generated static document directly and does
not preserve the response-level security headers emitted by the verified worker
adapter. The live document therefore carries CSP and referrer meta fallbacks;
HSTS, frame ancestry, permissions policy, and content-type headers remain a
hosting-edge responsibility. This platform boundary is recorded, not inferred
away. See `docs/release/RELEASE_RECORD_2026-08-10.md`.
