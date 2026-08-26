# Master-plan review record

- Reviewed artifact: `docs/product/GORILLA_MASTER_PLAN.md`
- Date: 2026-07-26
- Review mode: seven critique → correction passes

This record is evidence of review, not a claim of literal perfection. Future brand, legal, user-testing, and real-device evidence may require further corrections.

## Pass 1 — originality and authorship

Question:

Can the proposal still be recognized as a recolored derivative if its logo and copy are removed?

Issues found:

- product-carousel thinking was too close to a common beverage-site pattern;
- “more advanced motion” could have encouraged copying scene order or timing;
- using downloaded official assets publicly could weaken the authorship story.

Corrections:

- replaced the clone/reskin premise with `Five States of Instinct`;
- created a signal-based selection → truth → compare → locator funnel;
- prohibited reference measurements, timings, media, code, and exact composition;
- added a private provenance ledger and public-rights gate;
- added a fictional-brand fallback.

Evidence:

- clean-room ADR;
- originality rules in the master plan;
- ignored research directories;
- no production app or media in the repository.

## Pass 2 — product truth and localization

Question:

Can a fact that is official in another market or inconsistent in the current API leak into Uzbekistan content?

Issues found:

- international product formulas differ;
- local API localization and some units require verification;
- a silent locale fallback could mix languages;
- campaign copy could be mistaken for approved brand copy.

Corrections:

- market-specific claim schema;
- current packaging/certificate/brand-sheet evidence required;
- build failure for missing source, unit, locale, or approval;
- Uzbek Latin is the authoring source;
- Russian requires full parity; English remains disabled until complete;
- all campaign lines remain provisional.

Evidence:

- product content contract;
- M0 truth-table gate;
- definition of done.

## Pass 3 — legal and audience safety

Question:

Could the concept imply consumption, sporting success, mental/physical improvement, youth targeting, or official endorsement?

Issues found:

- the current category’s athlete/energy visual language creates local advertising risk;
- a footer warning alone is insufficient;
- an age gate could create false confidence;
- a polished private concept can look official.

Corrections:

- excluded consumption and athletes pending counsel approval;
- made the concept adult and product/flavor-led;
- warning and disclaimer reviewed in every independently shareable context;
- added access control, `noindex`, and explicit unsolicited-concept wording;
- made public launch a manual permission gate.

Evidence:

- brand/legal boundary in `AGENTS.md`;
- legal screenshot audit;
- authorization phase M0.

## Pass 4 — UX and conversion

Question:

Does the visitor have to endure the awards narrative before doing a useful task?

Issues found:

- spectacle could dominate product comparison;
- a cinematic scroll can inflate engagement metrics without increasing intent;
- culture/news could become stale filler;
- fake locator data would produce a dishonest conversion.

Corrections:

- product and locator actions are available in hero and navigation;
- selector, truth, compare, and find form the core journey;
- one editorial culture story replaces an automatic wall;
- locator uses verified destinations only;
- scroll depth/time are diagnostic, not primary KPIs.

Evidence:

- scene jobs and CTAs;
- conversion model;
- non-goals and locator phase gates.

## Pass 5 — mobile, accessibility, and motion comfort

Question:

Is mobile a separate composition, and can all tasks be completed without hover, drag, long pins, or spatial motion?

Issues found:

- a desktop product stage would be fragile when compressed to touch;
- page-level horizontal motion risks overflow and trapped navigation;
- reduced-motion support alone would not pause long ambient media;
- disabled viewport zoom on the current site must not be repeated.

Corrections:

- mobile uses vertical product cards/direct controls;
- page-level horizontal overflow is prohibited;
- mobile pins are bounded and optional;
- content works without JS and with reduced motion;
- Pause control, 44 px targets, focus management, zoom, 200% tests, and assistive-tech matrix added;
- test matrix now includes 320×568 and 430×932.

Evidence:

- per-scene mobile and reduced states;
- accessibility gate;
- visual/manual matrix.

## Pass 6 — architecture, lifecycle, performance, and security

Question:

Can advanced motion ship without permanent hydration, leaks, jank, unbounded media, or brittle global cleanup?

Issues found:

- React SPA was unnecessary for static product content;
- WebGL-first and smooth-scroll defaults create high failure surface;
- GSAP scenes could leak through navigation/resize;
- a hero video could destroy mobile LCP;
- a future form/map could add privacy and abuse risk.

Corrections:

- superseded SPA ADR with Astro static-first;
- native scroll and no UI-runtime baseline;
- WebGL isolated behind a kill gate;
- local scene ownership and deterministic cleanup;
- poster-first video with hard route/page budgets;
- form/map introduced only behind secure adapters and explicit gates;
- CSP, SBOM, license audit, privacy-safe RUM, and immutable rollback.

Evidence:

- ADR-0003;
- target architecture;
- performance budget;
- CI/CD and soak tests.

## Pass 7 — execution and release readiness

Question:

Can a future implementation agent execute the work without skipping discovery, mixing art directions, or silently waiving failed gates?

Issues found:

- a giant one-shot build could lock in weak design;
- multi-agent work could overlap and overwrite;
- phrases like “perfect first try” could encourage unsupported pass claims;
- public deployment could happen before rights approval.

Corrections:

- phased M0–M11 delivery with exit criteria;
- exactly two creative territories, then one selected system;
- vertical slice before scale;
- one specialist owner per file/decision;
- five mandatory evidence-based review lenses for every material step;
- explicit stop conditions for public push/deploy and invented inputs.

Evidence:

- executable GPT-5.6 goal prompt;
- multi-agent model;
- phase gates;
- definition of done.

## Remaining external blockers

The plan cannot resolve these internally:

- written Gorilla/IP permission;
- approved brand kit and font rights;
- current packaging/product truth;
- final legal warning and ad-law interpretation;
- verified retailer data;
- commissioned media and people releases;
- professional Uzbek/Russian copy approval;
- real target-device and Tashkent network measurements.

These are explicit M0 inputs, not implementation TODOs.
