# Test strategy

- Scope: M4–M11 verification for the static Gorilla Uzbekistan concept
- Owner: QA/performance
- Last updated: 2026-08-10
- Rule: a test file is a gate definition, not proof of a pass

## Release test pyramid

### Unit

Vitest covers deterministic boundaries that do not need a browser:

- environment and release-mode parsing;
- content schemas and unsafe-data rejection;
- locale-path and canonical URL preservation;
- compare and product-explorer state transitions;
- motion capability precedence;
- scene-registry duplicate protection, reverse cleanup, aggregation, and idempotency.

Command:

```text
pnpm test
```

Configured domain modules keep a 90% minimum. The 2026-08-10 candidate records
100% statements, lines, and functions, plus 97.27% branches across 80 tests.

### Production browser integration

Playwright runs against the built `dist` artifact through `astro preview`; it
does not use a development-only page.

Required route inventory in each enabled locale:

```text
/{locale}
/{locale}/products
/{locale}/products/original
/{locale}/products/zero
/{locale}/products/extra
/{locale}/products/mango-coconut
/{locale}/products/lychee-pear
/{locale}/compare
/{locale}/find
/{locale}/culture
/{locale}/faq
/{locale}/contact
/{locale}/legal/privacy
/{locale}/legal/product-information
```

Chromium verifies the complete route, locale, axe, semantic, no-JS, motion,
media, interaction, and responsive matrix. Firefox and WebKit run explicit
cross-engine route, media, product, and no-JS contracts; Chromium-only tests are
reported as intentional skips rather than hidden by a broad test filter.

Command:

```text
pnpm build
pnpm exec playwright test
```

The browser suite requires the pinned Playwright and axe-core versions plus the
installed Chromium, Firefox, and WebKit binaries.

### Visual regression

The static-motion Uzbek homepage is compared at eleven approved viewports:

| Baseline | Viewport |
| --- | ---: |
| compact-small | 320 × 800 |
| compact | 360 × 800 |
| mobile | 390 × 844 |
| mobile-large | 412 × 915 and 430 × 932 |
| phone landscape | 844 × 390 |
| tablet | 768 × 1024 |
| landscape | 1024 × 768 |
| desktop | 1366 × 768 and 1440 × 900 |
| wide | 1920 × 1080 |

Compare and Contact page leads add mobile 390 and desktop 1440 baselines, for
fifteen reviewed captures in total. Fonts and images settle before capture.
The capture-only stylesheet exposes `content-visibility: auto` scenes so the
baseline records real semantic layout rather than intrinsic placeholders;
production deferred rendering remains covered by scroll and performance tests.
A baseline update is a reviewed design change, never an automatic CI repair.

### Motion performance journey

The Chromium performance project runs three fresh browser contexts against a
production preview with CPU throttled by a factor of four. Every session covers
responsible entry, cold and warm full-page scroll, hero pointer depth, and all
five product selections.

Hard limits:

- long tasks: at most 50 ms;
- application work inside a long animation frame (`scriptDuration` plus
  `styleAndLayoutDuration`): at most 16 ms;
- long-animation-frame `blockingDuration`: at most 16 ms;
- Event Timing interactions: at most 200 ms.

Render/presentation duration stays in the evidence for diagnosis but is not
mislabelled as application work. The gate requires browser support for all
three observer types and fails closed when evidence is malformed.

Command:

```text
pnpm test:performance
```

### Lighthouse

The pinned Lighthouse CLI measures three production routes three times:

- Uzbek homepage;
- Original product;
- Find Gorilla.

The median gate is 95 or higher for performance, accessibility, best practices,
and SEO. LCP must be at most 2.5 seconds, CLS at most 0.1, and TBT at most
150 milliseconds. INP requires field or controlled interaction evidence and is
not inferred from Lighthouse TBT.

The runner accepts exactly three reports per route and fails closed for a
runtime error, invalid category score, incomplete run count, or missing,
non-finite, null, or negative metric. It verifies that the preview process owns
the expected port and records the exact built entry SHA-256.

Command:

```text
pnpm test:lighthouse
```

The repository runner uses `lighthouse@13.4.1`, records nine raw JSON reports,
calculates medians directly, writes a machine-readable summary, and exits
non-zero on any failed category or metric. Reports remain local under
`test-results/lighthouse/`.

## Stable contracts

Tests depend on product semantics rather than generated class names:

- `main#main-content`;
- one visible `h1`;
- locale-prefixed real links;
- `[data-motion-scene="<canonical-id>"]`;
- `[data-motion-toggle][aria-pressed]`;
- `html[data-motion-tier="full|lite|reduced"]`;
- `html[data-motion-preference="system|full|lite|reduced"]`.

Removing one is a contract change and requires synchronized tests and
documentation.

## Manual evidence still required

Automation does not prove:

- NVDA, VoiceOver, or TalkBack comprehension;
- real touch comfort and browser-chrome/safe-area behavior;
- thirty-minute physical-device thermal and memory stability;
- Tashkent mobile-network behavior;
- warning, claim, brand, and independently shareable screenshot approval;
- signed-in production interaction when the owner-only access gate cannot be automated.

Each item remains pending until a dated device/browser/result record exists.

## Failure policy

- A missing route, scene, locale, or link is a product defect, not a flaky test.
- Axe violations are not suppressed without a standards-based explanation and a compensating test.
- Visual differences are inspected before any baseline update.
- Timing failures trigger media/choreography simplification before budget relaxation.
- Retries expose cross-engine flakiness; they do not convert the first failure into evidence.
