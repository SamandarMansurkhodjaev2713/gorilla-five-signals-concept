# Target architecture

## Architectural outcome

Build a static-first Astro site whose product, legal, localization, and navigation content works without JavaScript. Client code progressively adds authored motion and local interaction.

Do not create empty layers. A folder appears only with its first cohesive module.

## Planned tree

```text
.
├── public/
│   ├── favicon/
│   ├── fonts/                       # licensed, subset WOFF2 only
│   ├── media/generated/             # optimized derivatives only
│   ├── robots.txt
│   └── site.webmanifest
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── 404.astro
│   │   └── [locale]/
│   │       ├── index.astro
│   │       ├── products/
│   │       │   └── [slug].astro
│   │       ├── find.astro
│   │       ├── culture.astro
│   │       ├── faq.astro
│   │       ├── contact.astro
│   │       └── legal/
│   ├── layouts/
│   │   ├── SiteLayout.astro
│   │   └── LegalLayout.astro
│   ├── features/
│   │   ├── navigation/
│   │   ├── hero/
│   │   ├── range-intro/
│   │   ├── flavor-explorer/
│   │   ├── product-lab/
│   │   ├── product-compare/
│   │   ├── culture-signal/
│   │   ├── store-locator/
│   │   ├── faq/
│   │   ├── contact/
│   │   └── footer/
│   ├── components/
│   │   ├── primitives/
│   │   └── composition/
│   ├── content/
│   │   ├── products/
│   │   ├── flavors/
│   │   ├── stores/
│   │   ├── culture/
│   │   ├── faqs/
│   │   ├── legal/
│   │   ├── media/
│   │   └── sources/
│   ├── content.config.ts
│   ├── motion/
│   │   ├── bootstrap.ts
│   │   ├── capability-policy.ts
│   │   ├── create-scene.ts
│   │   ├── scene-contract.ts
│   │   ├── route-transitions.ts
│   │   └── tokens.ts
│   ├── assets/
│   │   ├── images/
│   │   └── posters/
│   ├── styles/
│   │   ├── reset.css
│   │   ├── tokens.css
│   │   ├── typography.css
│   │   ├── utilities.css
│   │   └── global.css
│   ├── config/
│   │   ├── env.ts
│   │   └── site.ts
│   └── lib/
│       ├── accessibility/
│       ├── analytics/
│       ├── media/
│       └── validation/
├── scripts/
│   ├── media/
│   │   ├── build-images.mjs
│   │   ├── build-video.mjs
│   │   └── verify-media.mjs
│   ├── verify-budgets.mjs
│   ├── verify-links.mjs
│   └── verify-provenance.mjs
├── tests/
│   ├── accessibility/
│   ├── e2e/
│   ├── fixtures/
│   ├── performance/
│   └── visual/
├── docs/
│   ├── architecture/
│   ├── content/
│   ├── decisions/
│   ├── design/
│   ├── motion/
│   ├── product/
│   ├── quality/
│   └── release/
├── media-source/                    # private originals, ignored
└── _research/                       # local research, ignored
```

## Import boundaries

```text
pages/layouts → features → primitives
features → validated content + public motion API
content → no UI or motion imports
motion runtime → no feature internals
feature A ↛ feature B internals
```

- Global application state is prohibited until a real cross-route state requirement exists.
- Shareable flavor/product selection lives in the URL.
- Ephemeral interaction state stays local to the owning feature.
- External data and environment variables cross a Zod-validated boundary.
- Side effects belong to explicit controllers or adapters.

## Feature anatomy

A motion-enabled feature may contain:

```text
feature-name/
├── FeatureName.astro
├── feature-name.css
├── feature-name.model.ts
├── feature-name.scene.ts
└── feature-name.spec.ts
```

The scene module receives a local root and typed scene data. It never queries the global document for feature elements.

## Motion capability model

```ts
type MotionCapability =
  | { kind: "full"; reason: "capable-fine-pointer" | "user-enabled" }
  | { kind: "lite"; reason: "touch" | "data-saver" | "constrained-device" }
  | { kind: "reduced"; reason: "system-preference" | "user-disabled" };
```

This is capability detection, not user-agent sniffing. Device hints may only lower the tier. The user’s explicit preference wins.

### Ownership contract

Every scene owns and deterministically releases:

- GSAP match-media context and timelines;
- ScrollTriggers;
- AbortController;
- requestAnimationFrame identifiers;
- event listeners;
- Resize/Intersection/Mutation observers;
- media playback and decode work.

Teardown reverts only owned resources. Feature code must never call a global cleanup such as `ScrollTrigger.killAll()`.

The root runtime owns only:

- route transitions;
- navigation overlay;
- global motion preference;
- one coordinated refresh after fonts and LCP media settle.

## Media architecture

Originals never enter the deployable tree. Each production asset requires a manifest record:

```ts
type MediaRecord = {
  id: string;
  kind: "image" | "video" | "audio" | "model";
  owner: string;
  sourceUrl?: string;
  license: string;
  permissionEvidence?: string;
  rightsExpiresAt?: string;
  territories: readonly string[];
  peopleConsent?: string;
  checksumSha256: string;
  alt: LocalizedText | null;
  decorative: boolean;
};
```

Build rules:

- images: art-directed AVIF/WebP plus safe fallback, declared dimensions;
- transparent cans: optimized derivatives, never multi-megabyte source PNGs;
- videos: mobile/desktop crops, WebM and MP4, poster, muted decorative loops;
- speech: captions and transcript;
- LCP: poster-first, video loads after LCP;
- below fold: `preload="none"`, proximity or intent loading, pause out of view;
- third-party social: click-to-load behind consent;
- CI verifies rights, checksums, codec, dimensions, duration, and weight.

## Product content contract

```ts
type ProductClaim = {
  id: string;
  market: "UZ";
  statement: LocalizedText;
  value?: DecimalString;
  unit?: ProductUnit;
  sourceId: string;
  status: "draft" | "brand-approved" | "legal-approved";
  verifiedAt: IsoDate;
  verifiedBy: string;
};

type Product = {
  slug: string;
  sku: string;
  status: "draft" | "approved" | "archived";
  name: LocalizedText;
  description: LocalizedText;
  themeId: ProductThemeId;
  flavorNotes: readonly LocalizedText[];
  canMediaId: string;
  posterMediaId: string;
  claims: readonly ProductClaim[];
  warnings: readonly LegalWarning[];
  ctas: readonly ProductCta[];
  seo: LocalizedSeo;
};
```

The build fails when:

- a product fact lacks an approved source;
- a market or unit is missing;
- a meaningful image lacks alt text;
- media permission is missing or expired;
- a required locale is incomplete;
- a CTA has an empty or placeholder destination.

## Responsive architecture

Working ranges:

- compact: 320–599;
- medium: 600–1023;
- desktop: 1024–1439;
- wide: 1440+.

These are composition conditions, not four cloned designs. Container queries own local layout. `gsap.matchMedia()` owns choreography variants.

Rules:

- minimum supported viewport: 320 px;
- zoom remains enabled;
- semantic reading and focus order stay stable;
- mobile and desktop use separate storyboards;
- content parity across sizes;
- safe-area and dynamic viewport units;
- hover is enhancement only;
- no drag-only action;
- 44×44 px practical touch target;
- 200% zoom and text-spacing overrides are release tests.

## Static and enhancement failure model

The baseline page must remain useful when:

- JavaScript is disabled or fails;
- GSAP fails to load;
- video decoding fails;
- reduced motion is enabled;
- data saver is active;
- a third-party map or form endpoint is unavailable;
- an image or font times out.

Fallback is not a second-class design. It contains the same product truth, warning, navigation, and CTA path.

## WebGL policy

WebGL is not in the baseline. Product materiality comes from pre-rendered 3D, responsive posters, short loops, masks, light sweeps, and layered transforms.

An isolated WebGL spike is allowed only when it proves unique value and passes all gates:

- post-LCP lazy chunk;
- static poster fallback;
- no dependency for navigation or content;
- DPR capped at 1.5;
- one visibility-aware canvas;
- context loss/restoration;
- complete resource disposal;
- bounded textures and memory;
- stable 30-minute mid-tier mobile soak;
- no performance-budget regression.

Failing any gate removes the enhancement.
