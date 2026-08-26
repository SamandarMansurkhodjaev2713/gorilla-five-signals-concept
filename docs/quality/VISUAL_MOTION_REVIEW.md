# Visual and motion foundation review

> Historical foundation record from 2026-07-26. Its open implementation gates
> are superseded by `QA_STATUS.md` and
> `RELEASE_REVIEW_2026-08-10.md`. The final measured font-loading decision is
> ADR-0005; current external-only gates are manual assistive technology and a
> physical-device endurance trace.

## Scope

Reviewed artifacts:

- `docs/design/DESIGN_SYSTEM.md`;
- `docs/design/MOBILE_STORYBOARD.md`;
- `docs/motion/MOTION_SYSTEM.md`;
- `docs/motion/SCENE_CONTRACTS.md`;
- `src/styles/*`;
- `src/motion/*`.

Review date: 2026-07-26.

Each pass records a concrete failure hypothesis, evidence, correction and remaining gate. A pass is not considered successful merely because no obvious issue was noticed.

## Pass 1 — distinctive art direction and product truth

### Criticism

The initial automated design-system recommendation produced Space Grotesk, pink accent and generic “vibrant blocks.” That system could belong to an agency, gaming product or unrelated beverage. Early supporting surfaces also treated Extra and Mango–Coconut as warm dark variants, which did not respect the actual packshots.

### Evidence

- official marker values already recorded in the master plan;
- direct visual inspection of all five repository packshots;
- Original/Zero share black/lime packaging;
- Extra combines deep petrol, bronze and orange;
- Mango–Coconut combines cyan/blue, orange, lime and white;
- Lychee–Pear combines magenta, yellow, green and white.

### Improvement

- rejected the automated palette and Space Grotesk recommendation;
- fixed the art direction to Signal / Industrial Editorial;
- created a stage/instrument alternation unique to product selection and product truth;
- limited each flavor’s surrounding UI to one marker and one dark supporting surface;
- changed Extra support to petrol-black and Mango–Coconut support to cyan-black;
- documented the packshot as the complete source of packaging color rather than spreading every package hue into the whole interface;
- prohibited copied composition, custom cursor, infinite marquee and generic neon/glass effects.

### Result

Pass. The system is recognizably product-specific without becoming five disconnected mini-sites.

## Pass 2 — typography, script parity and font loading

### Criticism

A distinctive display face is useless if Uzbek apostrophes, Russian Cyrillic, units or warnings fall back unexpectedly. Network-hosted fonts would also create privacy, reliability and performance risk. `font-display: block` or a font-gated loader would contradict the immediate-content requirement.

### Evidence

- Google Fonts upstream metadata lists Unbounded as OFL with Latin Extended, Cyrillic and Cyrillic Extended, weight axis 200–900;
- Google Fonts upstream metadata lists Onest as OFL with the same required scripts, weight axis 100–900;
- both upstream OFL 1.1 files were inspected;
- master font budget is 140 KB on first-view mobile.

### Improvement

- selected Unbounded 700–900 only for display and Onest 400–700 for text/UI/legal/data;
- specified four self-hosted WOFF2 script subsets and route-aware two-file preloading;
- added explicit Unicode ranges, system fallbacks, and the measured policy now
  recorded in ADR-0004;
- created Uzbek/Russian/product/unit specimen corpus;
- prohibited rasterized text and condensed legal copy;
- documented FontBakery, checksums, upstream commit, license and subset evidence;
- kept content paint independent of `document.fonts.ready`.

### Remaining gate

This was an open foundation gate on 2026-07-26. It is now closed: all four
deterministic subsets ship with verified checksums, measured sizes, and passing
responsive/Lighthouse evidence.

### Result

Architecture pass; release gate open until physical font artifacts and screenshots exist.

## Pass 3 — contrast and complete control states

### Criticism

Brand lime looks strong on black but fails as text on mineral paper. One universal blue focus color cannot contrast sufficiently against both near-black and paper. Extra bronze is only slightly above the AA threshold on ink, so opacity or media blending could invalidate it. Generic hover-only controls would fail touch and keyboard use.

### Evidence

WCAG relative-luminance calculations:

- paper/ink `18.37:1`;
- lime/ink `11.23:1`;
- Original/ink `11.25:1`;
- Zero/ink `6.86:1`;
- Extra/ink `4.62:1`;
- Mango–Coconut/ink `10.74:1`;
- Lychee–Pear/ink `5.96:1`;
- dark focus blue/ink `10.65:1`;
- light-surface focus/paper `6.89:1`.

### Improvement

- split focus into `focus-on-dark` and `focus-on-light`;
- prohibited lime body text on paper;
- required an opaque semantic scrim over media;
- prohibited reducing Extra marker opacity when it carries text/boundary meaning;
- implemented default, hover, focus, pressed, selected, disabled, loading, success and error states;
- added paper-context control and field behavior;
- made selection use name, marker, boundary and check/ARIA state;
- added forced-colors and more-contrast behavior;
- enforced 44 px minimum target and 8 px adjacent spacing in the design contract.

### Result

Pass for defined token pairs. Animated/media intermediate frames still require rendered-frame measurement per feature.

## Pass 4 — mobile composition and input robustness

### Criticism

A desktop pinned product stage collapsed to mobile would cause excessive scroll distance, gesture conflict and clipped localization. Five flavors in a horizontal carousel would make discovery dependent on swiping and risk page overflow. A poster-driven hero could bury the first action below the fold.

### Evidence

Mandatory matrix includes 320×568 through 430×932 plus tablet and phone landscape. The product names vary substantially in length, and mobile has no fine-pointer affordance.

### Improvement

- authored a scene-by-scene mobile storyboard rather than breakpoint notes;
- replaced horizontal flavor carousel with complete vertical product cards;
- kept explicit selection buttons and a dismissible comparison tray;
- capped any mobile pin at 150svh and removed pinning from most scenes;
- required primary hero action at the first scroll boundary;
- defined poster-first mobile film with explicit Play;
- made accessible result list primary and deferred the map;
- specified 320 px, landscape, 200% zoom, text-spacing and grayscale assertions;
- prohibited page-level overflow, drag-only interactions and hover dependencies.

### Result

Pass at specification/foundation level. Feature implementation still needs visual regression and real-device evidence.

## Pass 5 — motion accessibility and performance

### Criticism

An “awards” brief can easily justify decorative perpetual movement, loader theater, mobile autoplay, and simultaneous animation of every element. Merely disabling timelines under reduced motion would leave hidden content if initial CSS depended on JavaScript.

### Evidence

- project budgets require all Lighthouse categories ≥95, mobile TBT ≤150 ms and no long animation task above 50 ms;
- reduced motion, data saver, touch and JS failure are explicit release cases;
- one scene may have at most two moving focal elements.

### Improvement

- defined Full/Lite/Reduced for all 13 scenes;
- made the server-rendered end state visible before JavaScript;
- limited entrance to 880 ms and local scene movement to named transform distances;
- made Lite the touch/data-saver baseline;
- removed custom cursor, infinite marquee, smooth scroll and perpetual ambient drift;
- changed film to poster-first and explicit Play on mobile;
- allowed repeating progress only for a real async operation and removed it in Reduced;
- constrained animation to transform/opacity and finite material cues;
- required native scroll, Pause controls, offscreen media pause and 20-cycle soak evidence.

### Result

Pass. The system preserves spectacle through composition and finite transitions rather than continuous work.

## Pass 6 — lifecycle, race conditions and cleanup

### Criticism

GSAP features often leak because they use global selectors, global plugin cleanup, untracked RAF/listeners, or async setup that finishes after navigation. Rapid product selection can queue timelines and resolve to stale state. A motion preference change needs a deterministic rebuild path.

### Evidence

Direct inspection of `src/motion` found these ownership risks in the naive approach:

- a scene setup exception could occur before a GSAP context handle was retained;
- literal scene IDs needed tuple preservation to remain a closed union;
- changing an in-site preference needed an explicit capability refresh method;
- cleanup failure in one resource must not skip remaining resources.

### Improvement

- created GSAP context before running setup and revert it on setup failure;
- scoped all query helpers to the supplied root;
- used AbortSignal for listeners and owned helpers for observer/RAF/cleanup;
- made destroy idempotent and cleanup reverse-ordered;
- aggregated cleanup errors after attempting every owned release;
- added a registry that rejects duplicate or late mounts;
- changed scene IDs to a literal tuple/union;
- added `CapabilityController.refresh()` for explicit user-setting changes;
- documented last-intent-wins selection, route-during-motion and capability rebuild policy;
- prohibited global selectors and `ScrollTrigger.killAll()`.

### Remaining gate

Unit/integration tests for setup failure, duplicate mount, rapid selection and 20-cycle cleanup must be implemented by the test owner against the final package graph.

### Result

Code/design pass; automated lifecycle evidence remains a release gate.

## Pass 7 — integration and release honesty

### Criticism

A polished design foundation can appear complete while its package and assets are not wired. Claiming green typecheck would be false if GSAP types are absent or the shared TypeScript configuration fails before reaching motion modules.

### Evidence

The first integration run correctly exposed:

- missing GSAP package/type integration;
- a shared TypeScript 6 `baseUrl`/path incompatibility before motion diagnostics;
- one lint finding where an inner cleanup error needed to be retained as the `AggregateError` cause;
- the four documented WOFF2 font artifacts were not present.

After coordination with the foundation owner:

- `gsap 3.15.0` exists in `package.json` and `node_modules`;
- shared TypeScript configuration was corrected;
- the AggregateError retains both setup/cleanup errors and uses the caught inner error as `cause`;
- repository `astro check` reports `0 errors`, `0 warnings`, `0 hints`;
- targeted ESLint for `src/motion/**/*.ts` passes;
- isolated strict TypeScript validation for all `src/motion` modules passes;
- every `src/styles` module parses successfully with Lightning CSS 1.33;
- production Astro build succeeds;
- scoped Prettier check passes.

### Improvement

- informed the root/package owner of the exact GSAP and TypeScript integration requirements and re-ran the gates after resolution;
- kept all package/config/font writes outside this agent’s explicit scope;
- documented expected font paths and release gates;
- avoided suppressions, stubs, unsafe declarations or fake “passed” evidence;
- preserved a system-font fallback so missing fonts do not hide content.

### Result

Code/package integration for this foundation is proven by formatting, lint, strict typecheck and build. Release integration remains open for font artifacts, automated lifecycle tests and rendered/real-device QA.

## Final foundation verdict

The visual/motion foundation is suitable for feature implementation because it now has:

- a specific art direction grounded in the real five-pack range;
- a measured semantic color system;
- a script-aware type and loading plan;
- a complete responsive/mobile composition;
- explicit control and accessibility states;
- Full/Lite/Reduced contracts for every scene;
- lifecycle-safe runtime boundaries;
- falsifiable integration and release gates.

It must not be declared production-complete from this document alone. Completion requires the unresolved physical assets, package integration, automated lifecycle tests, responsive renders, real-device traces and repository-wide quality suite.
