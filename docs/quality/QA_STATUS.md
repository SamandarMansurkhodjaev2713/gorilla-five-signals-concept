# QA status

- Snapshot date: 2026-08-26
- Technical verdict: **historical baseline; current rebuild requires fresh evidence**
- Deployment verdict: **public GitHub Pages release authorized and in progress**
- Public sign-off verdict: **review build only; commercial-launch claim held**
- Evidence rule: code existence and historical reports are not current pass evidence

## Executed evidence

| Gate | Status | Current evidence |
| --- | --- | --- |
| Format, lint, strict types | Passed locally | Prettier; ESLint zero warnings; Astro Check on 135 files with zero errors, warnings, or hints |
| Unit tests | Passed locally | 80 tests in 10 files |
| Unit coverage | Passed locally | 100% statements, lines, and functions; 97.27% branches |
| Static build | Passed locally | 47 localized/static pages |
| Content, links, budgets | Passed locally | Links across all 47 HTML files; 36 validated content records; initial JS/transfer limits pass |
| Media/font provenance | Passed locally | Eight media records; deterministic font subsets and checksums; pinned FFmpeg binary hash |
| Dependency security | Passed locally | `pnpm audit --audit-level high`: no known vulnerabilities |
| Dependency licenses/SBOM | Passed locally | Deterministic CycloneDX 1.6 inventory with 640 reviewed components |
| Chromium functional suite | Passed locally | 98 of 98 applicable tests |
| Chromium visual suite | Passed locally | 15 of 15 approved responsive/page-lead baselines |
| Firefox | Passed locally | 16 of 16 applicable cross-engine tests; 97 intentional Chromium-only skips |
| WebKit | Passed locally | 15 of 15 applicable cross-engine tests; 98 intentional Chromium-only skips |
| Accessibility and reflow | Passed locally | Axe WCAG 2.2 AA route matrix, keyboard, focus, 200% text, forced colors, 320 px, and reduced motion |
| Motion performance | Passed locally | Three independent CPU ×4 product journeys; long task ≤50 ms, application frame work ≤16 ms, LoAF blocking ≤16 ms, interaction ≤200 ms |
| Lighthouse median of three | Passed locally | Nine current reports; category medians 96–100; worst LCP 2.339 s; worst CLS 0.03347; worst median TBT 141 ms |
| Sites worker contract | Passed locally | Cloudflare-compatible artifact; redirect, headers, caching, and asset binding verified |
| Historical private release | Passed historically | Owner-only route and asset smoke passed before the public repository migration; identifiers are intentionally excluded from public source |

## Performance medians

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/uz/` | 96 | 100 | 100 | 100 | 2,339 ms | 0.03347 | 141 ms |
| `/uz/products/original/` | 100 | 100 | 100 | 100 | 1,891 ms | 0 | 36 ms |
| `/uz/find/` | 100 | 100 | 100 | 100 | 1,737 ms | 0 | 35 ms |

The runner built a dedicated artifact with entry SHA-256
`7129ed0ed7a5190539642cbc287ab9a536383504d775342a4461e3363899f5ca`,
executed exactly three reports per route, validated every JSON boundary, and
wrote the local evidence under `test-results/lighthouse/`. Reports are not
uploaded to a public result service.

## Manual evidence still required before a public launch claim

| Gate | Status | Required record |
| --- | --- | --- |
| Assistive technology | Pending external device session | Dated NVDA, VoiceOver, and TalkBack task results |
| Physical-device endurance | Pending external device session | Thirty-minute mid-tier Android/iPhone thermal, battery, frame, and memory observation |
| Final legal screenshots | Owner/legal controlled | Approval for hero, product, locator, mobile, OG, and independently shareable frames |
| Signed-in production smoke | Pending owner-authenticated session | Live locale, mobile menu, motion pause, metadata, media, and runtime-log check |
| 72-hour monitoring | Starts only after public promotion | Named owner, incident channel, and observation record |

These gates are not silently converted to “N/A.” They do not prevent an
owner-only portfolio review, but they prevent claiming a completed public
production launch.

The private Sites edge serves the generated static document directly and does
not preserve the response-level security headers emitted by the verified worker
adapter. The live document therefore carries CSP and referrer meta fallbacks;
HSTS, frame ancestry, permissions policy, and content-type headers remain a
hosting-edge responsibility. This platform boundary is recorded, not inferred
away. See `docs/release/RELEASE_RECORD_2026-08-10.md`.
