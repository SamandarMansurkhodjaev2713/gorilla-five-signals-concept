# ADR-0003: Static-first frontend foundation

- Status: accepted for the vertical slice
- Date: 2026-07-26
- Supersedes: ADR-0002

## Context

The deliverable is a localized campaign and product-discovery website, not a logged-in application. Core content, product facts, navigation, warnings, and store paths must be readable, indexable, and usable without client-side hydration.

The experience still requires authored typography, scroll choreography, flavor transitions, media control, and route transitions.

## Decision

Use:

- Astro 7.1 with static output;
- Vite 8 through Astro;
- Node.js 24 LTS;
- an exact pnpm version, committed lockfile, and frozen installs;
- strict TypeScript;
- native Astro components and small TypeScript controllers by default;
- Astro Content Collections and Zod for build-time content validation;
- CSS cascade layers, custom properties, container queries, and native scrolling;
- GSAP and ScrollTrigger only for choreography CSS cannot express clearly;
- Astro Image/Sharp plus FFmpeg and ffprobe for the media pipeline;
- Vitest, Playwright, axe-core, Lighthouse CI, and web-vitals.

No frontend framework runtime is included by default. A React, Preact, or other island requires a separate ADR demonstrating that local state complexity, accessibility, and measured bundle cost justify it.

## Consequences

Positive:

- meaningful HTML arrives before JavaScript;
- content and routes remain indexable;
- most sections have zero hydration cost;
- failure of motion or media does not remove content;
- product and locale schemas fail the build when incomplete;
- the motion runtime stays explicit and removable.

Tradeoffs:

- scene lifecycle and route transition ownership must be designed carefully;
- complex client state must remain local or URL-derived;
- a highly stateful future store locator may justify a small island.

## Rejected alternatives

### React SPA

Rejected because a permanent site-wide UI runtime does not justify its hydration and lifecycle surface for a static brand site.

### Next.js

Rejected until server rendering, authenticated state, server actions, or a platform-owned backend is required.

### WebGL-first implementation

Rejected as a baseline. Pre-rendered 3D and composited media provide a stronger reliability/performance ratio. WebGL remains an optional, isolated post-LCP enhancement behind a measurable gate.

### Smooth-scroll library

Rejected. Native scrolling is the baseline. No visual effect justifies rewriting scroll behavior without separate evidence and accessibility testing.

## Verification gate

The decision is validated by a vertical slice containing semantic navigation, hero, one flavor transition, one video scene, footer, and full/lite/reduced motion modes. If it misses the performance, cleanup, accessibility, or mobile gates, choreography is simplified before the rest of the site is built.
