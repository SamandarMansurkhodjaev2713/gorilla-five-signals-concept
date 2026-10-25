# Target architecture and implemented boundaries

Last source inspection: 2026-10-14. This describes the current candidate, not a
claim that every release gate has passed. Test/deployment evidence lives in
[QA status](../quality/QA_STATUS.md) and the
[release checklist](../release/RELEASE_CHECKLIST.md).

## Architectural outcome

A static-first Astro product-discovery site: localized product content, legal
information, navigation, and outbound handoffs arrive as HTML. Small TypeScript
controllers progressively add selection, sharing, media control, and authored
motion. There is no checkout, account backend, inventory API, or framework-wide
hydration runtime.

[ADR-0003](../decisions/ADR-0003-static-first-frontend.md) establishes this decision
and supersedes ADR-0002. Its adoption-time version is historical; exact current
versions are authoritative in `package.json`, `pnpm-lock.yaml`, `.node-version`,
and `.nvmrc`. At this inspection: Astro 7.3.1, Node 24.16.0, pnpm 11.17.0, strict
TypeScript, GSAP, and Zod.

The original planned tree here was a July sketch, not a scaffolding requirement.
Paths such as `features/hero`, `features/product-lab`, `components/primitives`,
`layouts/LegalLayout.astro`, and `lib/analytics` are not the implemented
architecture. Do not create empty folders to satisfy that historical sketch.
Git history retains it.

## Current representative tree

A responsibility map, not an exhaustive listing. Every path below exists;
comments explain the current owner rather than proposing empty layers.

```text
.
├── src/
│   ├── pages/
│   │   ├── index.astro, 404.astro, robots.txt.ts, sitemap.xml.ts
│   │   └── [locale]/
│   │       ├── index.astro, compare.astro, find.astro
│   │       ├── culture.astro, faq.astro, contact.astro, 404.astro
│   │       ├── products/index.astro, products/[slug].astro
│   │       └── legal/privacy.astro, legal/product-information.astro
│   ├── layouts/SiteLayout.astro
│   ├── components/
│   │   ├── site/                    # shell, warning, entry, page lead
│   │   └── home/                    # authored homepage compositions
│   ├── features/
│   │   ├── site/                    # catalog, locale, URLs, static paths
│   │   ├── products/                # Atlas/native archive and controller
│   │   ├── product-detail/          # five worlds, packshot, truth, handoff
│   │   │   ├── world-art/           # variant art components
│   │   │   └── worlds/              # per-product material CSS
│   │   ├── product-explorer/        # homepage selection, URL/media adapters
│   │   ├── flavor-reactor/          # homepage product choreography
│   │   ├── compare/                 # state, URL, clipboard, Signal Duel UI
│   │   ├── locator/                 # search handoff, not live inventory
│   │   ├── home-signal/             # homepage section styling
│   │   └── culture/, faq/, contact/ # editorial route presentation
│   ├── content.config.ts
│   ├── content/
│   │   ├── schema/                 # product/media/source/support schemas
│   │   └── products/, flavors/, stores/, culture/, faqs/, legal/, media/, sources/
│   ├── config/environment.ts, release.ts, site.ts
│   ├── scripts/motion-runtime.ts, route-lifecycle.ts
│   ├── motion/
│   │   ├── capability-policy.ts, preference-controller.ts
│   │   ├── create-scene.ts, scene-contract.ts, scene-registry.ts
│   │   ├── owned-scene-resources.ts, owned-scene-context.ts
│   │   ├── cleanup-stack.ts, diagnostics.ts, motion-engine.ts, tokens.ts
│   │   ├── native-easing.ts        # sampled, tested GSAP-compatible curves
│   │   ├── native/                 # finite shared-clock WAAPI ownership
│   │   ├── runtime/                # render gate, scene/capability ownership
│   │   └── scene-setups/           # application choreography adapters
│   ├── assets/brand/               # approved tracked build inputs
│   └── styles/                     # reset, tokens, type, shared controls
├── public/
│   ├── favicon.svg, site.webmanifest, og.png, _headers
│   ├── fonts/                      # WOFF2, manifest, OFL notices
│   └── media/generated/            # products, brand, material, film
├── scripts/
│   ├── build-brand-assets.mjs, build-product-film.mjs, build-fonts.py
│   ├── verify-content-integrity.mjs, verify-provenance.mjs, verify-fonts.mjs
│   ├── verify-links.mjs, verify-budgets.mjs, verify-ffmpeg-toolchain.mjs
│   ├── generate-sbom.mjs, verify-sbom.mjs, sbom/
│   └── run-lighthouse.mjs, lighthouse/  # isolated measurement lifecycle
├── tests/unit/, tests/e2e/, tests/fixtures/, tests/performance/
├── docs/architecture/, content/, decisions/, design/, motion/, product/, quality/, release/
└── .github/                        # quality, security, Pages workflows
```

`_reference/`, `_research/`, and `media-source/` are ignored local-only locations,
not required empty directories. Build artifacts, reports, caches, and dependencies
are generated and ignored. Approved PNG inputs in `src/assets/brand/` are tracked
for reproducible derivative generation but not imported by runtime UI. The
clean-room rule permits approved Gorilla assets while
[ADR-0001](../decisions/ADR-0001-clean-room-reimplementation.md) forbids importing
reference-site code or assets.

## Import and side-effect boundaries

```text
pages + SiteLayout → authored UI + feature catalog/view models
catalog/view models → validated collections + locale/base-path helpers
local state/contracts → no GSAP or infrastructure dependency
feature controllers → local state + elements/view + named browser adapters
client entry points → feature controller factories + motion runtime
motion runtime → owned scene core + application scene-setup registry
scene-setup adapters → feature choreography through typed SceneSetup contracts
content schemas/records → no UI or motion imports
```

The reusable motion core (`create-scene`, registry, cleanup, capability policy)
does not need feature internals. The application registry is a composition
boundary: `motion/scene-setups/product.ts` imports
`features/flavor-reactor/flavor-reactor-motion.ts`. The old blanket rule “motion
runtime imports no feature internals” inaccurately described that registry.
Keep feature knowledge in explicit application adapters, not the generic core.
Do not share state through feature-to-feature internal imports; promote a real
shared contract only when a concrete consumer requires it.

Reactor, Material Film, Manifesto, Terminal, Service Dock and Footer are concrete
consumers of the finite native player and adaptive sampled easing. The neutral
player owns no feature selectors, cue schedule or product data; adapters supply
typed effects, namespace and lifecycle callbacks.
Each adapter retains its GSAP fallback and presentation guard. One-shot entrance
adapters share `native/finite-entrance-owner.ts`, which stops owned fallback work
before restoring the exact inline snapshot. Equal effects may be copied only
within one construction batch; no target/effect cache outlives that operation.
See [ADR-0012](../decisions/ADR-0012-shared-finite-native-entrances.md),
[ADR-0013](../decisions/ADR-0013-native-home-entrances.md),
[ADR-0014](../decisions/ADR-0014-native-service-and-discovery-priority.md) and
[ADR-0015](../decisions/ADR-0015-footer-native-ownership.md).
Cross-engine and performance acceptance remain separate from this
responsibility map.

There is no generic `Infrastructure` folder because browser effects are named and
owned: `compare-location-store.ts`, `compare-clipboard.ts`,
`product-explorer-url.ts`, media controllers, diagnostics, and route lifecycle.
Pure selection stays separate from DOM, history, clipboard, and playback. Add an
infrastructure module for a real integration, not a speculative layer.

Product/compare selections are URL-derived and shareable; ephemeral interactions
belong to feature sessions. Cross-route motion preference and entry confirmation
are site-shell concerns, not a global product-state store. Environment access
crosses `config/environment.ts` validation: public releases require a non-loopback
HTTPS origin and a validated deployment base.

## Feature decomposition and lifecycle

Atlas separates contract/elements/view-model/selection/navigation/observer/session.
Compare separates contract/state/elements/view/events/session plus URL/clipboard
adapters. These isolate pure decisions from asynchronous browser ownership for
race/cleanup tests. CSS is split by section, world, or responsive composition.

The five detail worlds share `product-world-contract.ts`, shell, truth, and
handoff; `world-art/` and `worlds/` provide distinct compositions. The localized
detail route imports `features/product-detail/ProductDetailWorld.astro`, not the
obsolete same-named module formerly under `components/product/`.

`scripts/motion-runtime.ts` owns controller mounting/release at route boundaries;
`route-lifecycle.ts` owns navigation focus and scroll restoration. Generation
checks prevent stale asynchronous loading from mounting after route changes.
Functional controllers remain distinct from optional GSAP choreography.

`createOwnedScene` supplies a local root, scoped queries, abortable listeners,
owned observers/frames, GSAP context/match-media, and a cleanup stack. The registry
rejects duplicate scene IDs and destroys only registered handles. Document-level
root discovery belongs to mounting/composition, not feature choreography.

Teardown must release only owned resources and restore presentation. No feature
may call `ScrollTrigger.killAll()`. Capability rebuilds, failed setup, route
changes, image failure, and late clipboard completion are verification paths,
not merely architectural intentions.

## Motion capability contract

`motion/scene-contract.ts` is authoritative:

```ts
type MotionCapability =
  | { kind: "full"; reason: "capable-fine-pointer" | "user-enabled" }
  | { kind: "lite"; reason: "touch" | "data-saver" | "user-selected" }
  | {
      kind: "reduced";
      reason: "system-preference" | "user-disabled" | "runtime-fallback";
    };
```

`capability-policy.ts` checks explicit preference first; system mode then checks
reduced motion, data saver, and coarse pointer. It does not use user-agent strings
or an invented constrained-device heuristic to select a tier. Full/Lite/Reduced
and no-JavaScript retain the same content and action paths.

## Content and media contracts

Do not maintain copied pseudo-types here. Executable contracts are:

- `content/schema/product.ts`: localized name/description/SEO, stable IDs,
  nullable SKU, source ID, typed claims/units, warnings, CTA destinations;
- `content/schema/media.ts`: media ID, public path, hashes, ownership/license,
  required permission evidence, UZ territory, localized alt, derivative hashes,
  optional generator and rights-expiry records;
- `content/schema/source.ts` and `support.ts`: sources and supporting content;
  `content.config.ts` registers all eight collections.

Astro validates collection shape and locale completeness. `verify:content` checks
identity uniqueness and references. `verify:provenance` checks required evidence
fields, rights expiry, hashes, and registration of generated media. None can
certify substantive legal approval or source truth/currentness; the approval
register and product-truth review own those decisions. Do not promote unverified
nutrition, sugar, efficacy, inventory, or retailer facts into UI claims.

Brand derivatives use Sharp; film uses the pinned FFmpeg toolchain; fonts use
pinned Oswald/Onest packages under
[ADR-0005](../decisions/ADR-0005-font-delivery.md). Runtime UI uses generated
derivatives, responsive sources, dimensions, and native image fallback. Video is
poster-first, proximity/intent-loaded, visibility-aware, and finite. Speech would
require captions/transcripts. External embeds require a separate consent/failure
boundary; they are not a current dependency.

## Responsive, failure, and WebGL policy

320 px is the supported lower width, not a desktop canvas scaled down. CSS
composition conditions and container-local rules own layout; no universal
four-breakpoint map is imposed on every feature. Named specifications own motion
conditions. Preserve native scrolling, reading/focus order, safe areas, dynamic
viewports, keyboard/touch parity, visible focus, practical 44 px targets, 200%
text reflow, and text-spacing overrides.

Native content/links/controls, static art, and comparison fallback stay useful if
JavaScript, GSAP, media decode, fonts, or clipboard fail. The locator remains a
truthful search handoff, not a fake live-store service. Product truth and warnings
are never motion-dependent.

WebGL is not in the baseline. Any future scene requires an ADR, post-LCP lazy
loading, static fallback, bounded DPR/textures, visibility-aware work,
context-loss handling, disposal, a real-device 30-minute soak, and no budget
regression. A decorative effect alone does not justify the dependency.

## Verification commands and unresolved debt

Use the pinned runtime/package manager. `package.json` defines:

- `pnpm quality`: format/lint/types/coverage/build, artifact verifiers, film
  toolchain, dependency audit;
- `pnpm quality:pages`: source/build, artifact verification, audit; intentionally
  excludes local film-generation toolchain verification;
- `pnpm test:e2e`: browser journeys and responsive/a11y/failure/visual tests;
- `pnpm test:performance`: build plus dedicated CPU-throttled motion journeys;
- `pnpm test:lighthouse`: report tests and isolated production measurements.

Source/build success does not replace browser, performance, assistive-technology,
deployed-host, or legal review. Builds changing `dist/` must not run concurrently
with tests of that artifact. Lighthouse owns a separate artifact/server.

Remaining review items, not automatically waived by this document:

- The ownership factory decomposition below has scoped source evidence; final
  browser/capability/route verification must exercise its newly built artifact,
  not the frozen artifact served before this refactor.
- Scene IDs are registry identities, not folders. Historical `product-lab` does
  not prove a corresponding feature directory exists. Do not multiply the same
  ID within one registry without changing its keyed ownership contract.

## Five-lens documentation review — 2026-10-14

1. Correctness: replaced nonexistent planned paths and copied pseudo-types with
   inspected paths and executable schema references.
2. Architecture/cleanup: separated generic ownership from application composition;
   documented browser adapters and outstanding size/dead-code review explicitly.
3. UX/responsive/accessibility: retained native/no-JavaScript, keyboard/touch,
   reduced-motion, reflow, and warning invariants without claiming test completion.
4. Performance/security: preserved staged media, provenance, validated release
   config, WebGL opt-in, and immutable test artifacts; clarified verifier limits.
5. Maintainability/release: linked accepted ADRs, version/command authorities,
   QA/release gates. This documentation-only review ran no build or test and did
   not modify the runtime candidate.

## Obsolete product subtree removal — 2026-10-14

Removed nine tracked files under `src/components/product/`: `ProductCard.astro`,
`ProductDetailWorld.astro`, `ProductDetailArt.astro`, `product-detail.css`,
`product-detail-art.css`, and the four `product-detail-theme-*.css` files.
These are recoverable from Git history; no production asset was deleted.

Five-lens evidence and limits:

1. Correctness: exact name/path searches across `src`, `tests`, `scripts`, and
   `docs` found no runtime/test importer of the old world or card. The old world
   was the only importer of its art. CSS basenames had no importers; the single
   active `product-detail-art.css` import resolves explicitly to
   `features/product-detail/`, not the removed component folder. The only glob
   loader in those inspected sources reads content JSON, not components.
2. Architecture/cleanup: the active localized detail route imports the feature
   world and its explicit shell/packshot/art/truth/handoff/world/responsive CSS.
   Removing the unreachable subtree eliminates duplicate ownership names without
   touching the active controller, lifecycle, or scene registry.
3. UX/responsive/accessibility: no active route composition changed. Similar
   selector names also exist in active markup/CSS, so shared motion hooks and
   `features/product-detail/` were deliberately preserved.
4. Performance/security: no deployed asset, CSP, dependency, or served `dist/`
   file changed. A fresh build remains required to confirm unchanged emitted
   route artifacts; this removal makes no measured performance claim.
5. Maintainability/release: the representative tree and obsolete-code debt were
   updated. `git diff --check` is the local documentation/deletion check; no
   build/test was run during the parent's frozen-artifact browser suite.

### Ownership-factory decomposition — implemented 2026-10-14

The public `SceneSetupContext` and `createOwnedScene` API remain unchanged.
Only lifecycle mechanics were extracted; there is no generic scene framework:

- `owned-scene-resources.ts`: `createSceneResources({ root, engine, windowValue })` owns the abort
  controller, cleanup set, scoped match-media, nullable context reference, and
  `release()` snapshot; `runOwned()` and `requestFrame()` keep their current
  abort/context guards and remove completed frame cleanup entries.
- `owned-scene-context.ts`: `createSceneSetupContext({ root, capability, engine,
  resources })` builds the existing typed query/listen/observer/cleanup interface.
  It must not own a second cleanup set or a second abort controller.
- `create-scene.ts`: private `runSceneSetup(options, resources)`
  owns the setup/rollback transaction; `createSceneHandle(options, resources)`
  owns the phase closure and idempotent destruction. `createOwnedScene` validates
  the owning window and composes these helpers without changing public exports.

Each helper has one lifecycle responsibility. The main factory now validates its
owning window, composes resources, runs setup, and returns the handle; it does not
repeat rollback/disposal code. Internal resource methods declare `this: void`
because their arrow closures own state and setup-context methods safely forward
them. Resource/context types stay in motion-core modules rather than extending
the feature-facing public contract.

Preserved ordering: abort first; take and clear the cleanup snapshot;
`runCleanupStack` executes registered feature resources in reverse before media
and GSAP context reversion. The same rollback path must attempt every cleanup
even when one throws, retain setup plus cleanup errors as `AggregateError`, and
set normal destruction phase to `destroyed` in `finally`. Setup-time `runOwned`
before the GSAP context returns still has no assigned context; this refactor does
not change that pre-existing behavior or fabricate a context after setup throws.

`create-scene.spec.ts` now contains six passing scoped tests: original owned
event/frame registration and late-frame suppression plus setup rollback,
simultaneous setup/cleanup failure, throwing cleanup with complete remaining
disposal, and returned cleanup/observer disposal under repeated destroy. Existing
ordering assertions were retained. New assertions verify abort state, preserved
error/cause chains, cleanup order, and terminal phase after destruction failure.

Five-lens refactor evidence:

1. Correctness: six unit tests pass with original assertions intact; setup and
   cleanup errors retain their diagnostic messages and causes. The rollback test
   also confirms failed setup cannot dispatch late listener/frame work.
2. Architecture/cleanup: a single ownership object retains abort, scoped media,
   cleanup set, and context; setup-context construction owns no second resources.
   Setup rollback and ordinary destruction share one disposal mechanism.
3. UX/responsive/accessibility: no markup, CSS, content, capability contract,
   browser selection logic, or route-focus contract changed. Browser verification
   remains required on the rebuilt artifact; unit tests are not visual evidence.
4. Performance/security: no dependency, environment, global selector, global
   cleanup, or new network call was introduced. Scoped ESLint passed after its
   unbound-method finding was corrected with `this: void` on closure-backed
   internal methods; no suppression was added.
5. Maintainability/release: pinned-Node typecheck reports 218 files with zero
   errors/warnings/hints; scoped unit tests and lint pass, and `git diff --check`
   is clean. Full quality/build/browser/performance evidence belongs to the
   parent's next immutable candidate; none was claimed from the older `dist/`.
