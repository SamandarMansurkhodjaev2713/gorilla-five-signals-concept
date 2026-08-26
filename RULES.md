# Zero-tolerance rules

`AGENTS.md` is canonical. This file is a concise operational checklist.

## Never

- copy code, content, identity, media, or distinctive layouts from `_reference/`;
- represent this concept as official or publish protected Gorilla material without written permission;
- invent Uzbekistan product facts, retailer data, warnings, legal approval, or asset rights;
- show product consumption, target minors, or imply product-caused success without written local legal approval;
- introduce magic values, silent catches, secrets, unsafe assertions, or unvalidated environment access;
- leave listeners, timers, observers, media queries, GSAP contexts, or subscriptions without cleanup;
- use global document selectors for feature animation;
- use `ScrollTrigger.killAll()` in feature code;
- ship placeholder links, fake controls, fake forms, or non-functional buttons;
- make motion mandatory or ignore `prefers-reduced-motion`;
- load every image/video eagerly;
- use autoplay video without a product reason, poster, loading policy, and fallback;
- use `console.*` in production;
- add `TODO`/`FIXME` without an issue;
- add dependencies without license, maintenance, bundle, and security review;
- claim a check passed without evidence.

## Always

- design mobile and desktop intentionally;
- preserve semantic HTML and keyboard access through animation wrappers;
- validate boundaries at runtime;
- scope side effects to their owner;
- keep content independent from presentation;
- use stable keys and immutable updates;
- record architectural tradeoffs in ADRs;
- run the five review lenses from `AGENTS.md`;
- apply the full matrix in `docs/quality/ENGINEERING_STANDARD.md`.
