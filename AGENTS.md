# Project operating contract

This is the canonical instruction file for every human or automated contributor. `CLAUDE.md` and `RULES.md` may add navigation or concise reminders but must not contradict or duplicate this contract.

## Mission

Create a private, independent Gorilla Energy Uzbekistan product-experience concept with exceptional typography, motion, mobile behavior, accessibility, product clarity, and runtime performance. The result must be recognizably original and culturally grounded in contemporary Uzbekistan without falling into souvenir aesthetics or decorative folklore.

The user confirmed on 2026-07-26 that the required brand and publishing permissions have been obtained and that their legal team owns the legal approval process. The implementation may use the Gorilla identity and approved official assets. Product facts, advertising claims, people, and warning placement still require traceable sources and the documented quality gates.

## Source hierarchy

When instructions conflict, use this order:

1. explicit user instruction;
2. this file;
3. accepted ADRs in `docs/decisions/`;
4. `docs/quality/ENGINEERING_STANDARD.md`;
5. task-specific documentation.

## Clean-room rule

- `_reference/` is read-only research material and is excluded from Git.
- Never import, copy, transform, trace, or redistribute reference code or assets.
- Never copy brand names, product claims, copywriting, photography, video, logos, illustrations, or distinctive section composition.
- Abstract observations such as “horizontal product exploration” or “scroll-linked typographic reveal” are allowed only after creating a new visual and interaction solution.
- Every production asset must have recorded ownership, license, or generation provenance before release.

## Brand, product, and legal boundary

- Record the user-confirmed permission basis in `docs/release/APPROVAL_REGISTER.md`.
- Do not imply that Gorilla commissioned or officially operates the concept unless that exact status is separately confirmed.
- Use only official or independently produced assets with recorded provenance.
- Do not publish a product fact until it is linked to current Uzbekistan packaging, an approved certificate, or a brand-approved source record.
- Never import product facts from another market.
- Do not show consumption, target minors, use successful athletes, or imply product-caused sporting, social, physical, mental, or professional success without written local legal approval.
- An age confirmation does not waive any advertising restriction.
- Required warning language and placement must come from the brand or local counsel; contributors must not invent legal copy.
- If any individual asset or claim lacks traceable approval, exclude that item without blocking safe implementation of the rest.

## Required workflow

For every material decision or change:

1. State the user outcome and acceptance criteria.
2. Inspect only the context required to answer a concrete question.
3. Produce the smallest complete solution consistent with the target architecture.
4. Run five explicit review lenses:
   - correctness and edge cases;
   - architecture, coupling, and cleanup;
   - UX, responsive behavior, accessibility, and reduced motion;
   - performance, security, and dependency risk;
   - maintainability, documentation, and release readiness.
5. Improve the result after each failed lens.
6. Record evidence in the relevant task report or review log.

The five lenses are quality gates, not a promise of metaphysical perfection. Claims must remain falsifiable and supported by tests, measurements, or direct inspection.

## Architecture constraints

- Organize code by product feature and responsibility, not by an undifferentiated components bucket.
- Keep content, domain types, UI, motion orchestration, and infrastructure adapters separate.
- Side effects belong in explicit adapters or lifecycle-safe hooks.
- Use local element refs and scoped animation contexts; global selectors are prohibited in production motion code.
- Every listener, timer, subscription, observer, animation context, and media query must have deterministic cleanup.
- Do not call `ScrollTrigger.killAll()` from a feature; a feature may clean up only resources it owns.
- Prefer CSS for layout and state styling. Use GSAP for authored choreography and scroll-linked timelines.
- WebGL is opt-in per scene and must have a static or CSS fallback.

## Type and data rules

- TypeScript strict mode is mandatory.
- `any`, `object`, unchecked assertions, and non-null assertions are prohibited unless accompanied by `TYPE-EXCEPTION: <reason>` and a safer boundary cannot be expressed.
- External data and environment variables require runtime schema validation.
- Variant states use discriminated unions.
- Nullable states are handled explicitly.
- Content identifiers are stable semantic IDs, never array indices.

## UX and accessibility gates

- Design and verify at minimum: 360×800, 390×844, 768×1024, 1024×768, 1440×900, and 1920×1080.
- Mobile is a first-class composition, not a collapsed desktop layout.
- All functionality must work with keyboard and touch.
- Interactive targets aim for at least 44×44 CSS pixels and must satisfy WCAG 2.2 AA.
- Provide visible focus states, semantic landmarks, a coherent heading hierarchy, and accessible names.
- `prefers-reduced-motion` must preserve content and functionality with reduced or removed spatial motion.
- Never block entry behind an artificial progress counter.

## Performance gates

Initial targets for the production homepage on a representative mid-tier mobile profile:

- Lighthouse production median of three runs: at least 95 in every category;
- LCP: at most 2.5 seconds;
- INP: at most 200 milliseconds;
- CLS: at most 0.1;
- initial JavaScript: at most 90 KiB gzip on mobile;
- initial critical transfer: at most 900 KiB on mobile;
- no below-the-fold video request before user intent or proximity;
- zero unbounded autoplay media.

Budgets may be tightened after the art direction is selected. Any exception requires an ADR with measured benefit and fallback behavior.

## Code limits

- Functions should stay under 30 logical lines; exceptions require decomposition analysis.
- Modules should stay focused and generally under 200 logical lines.
- No magic values: visual constants belong in tokens; choreography values belong in named motion specifications.
- No boolean mode arguments; use named option objects or discriminated unions.
- No production `console.*`; use the approved structured diagnostics adapter.
- No dead code, commented-out code, silent catches, or fire-and-forget promises.
- `TODO` and `FIXME` require an issue identifier.

## Verification before handoff

Run all available checks appropriate to the change:

- formatting and lint;
- TypeScript;
- unit and integration tests;
- production build;
- dependency audit;
- responsive visual regression;
- keyboard and accessibility checks;
- reduced-motion checks;
- bundle and Lighthouse budgets.

Update documentation when commands, configuration, architecture, public APIs, or quality gates change.
