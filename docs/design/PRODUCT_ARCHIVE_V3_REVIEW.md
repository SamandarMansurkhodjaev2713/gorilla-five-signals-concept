# Product Archive v3 — five-lens review

## Outcome

The products route is a continuous five-frequency scan. Desktop keeps the
collection wall in view while every product gains a full visual field and
readable decision content. Mobile remains a native vertical document with all
five products present.

## Pass 1 — correctness and lifecycle

- Preserved five real anchor targets, URL hash, keyboard movement, history,
  IntersectionObserver ownership, no-JavaScript fallback, and deterministic
  cleanup.
- The focused six-scenario archive suite passes after the layout change.
- No product fact or retailer claim was added.

## Pass 2 — architecture and ownership

- Product selection remains owned by `product-atlas-session.ts`.
- The new product fields are presentation-only and local to the archive
  feature; no global tokens or shared route primitives were changed.
- Reused product semantic slugs instead of index-dependent styling hooks.

## Pass 3 — art direction, UX, and accessibility

- Reversed the desktop hierarchy: the persistent collection is the compact
  control plane and the current flavor chapter receives the larger stage.
- Replaced the empty chapter half with a product image and one of five distinct
  geometric fields: rupture, chamber, axial burst, collision, and orbit.
- Retained native links, visible focus, 44px actions, source order, reduced
  motion, and a single-column mobile document.

## Pass 4 — performance and resilience

- Added no script, dependency, canvas, WebGL, or additional media request.
- Geometry is CSS-only. Existing responsive `srcset`, loading, and decoding
  policies remain authoritative.
- Layout uses the existing sticky viewport and transform/opacity transition
  vocabulary.
- The archive sticky stage uses the shared `--z-sticky` layer, below the site
  header and above chapter media, so long-scroll compositing stays ordered.

## Pass 5 — maintainability and release evidence

- Component, chapter styling, and breakpoint behavior remain in their
  dedicated feature files.
- Formatting, 156-file typecheck, 47-route production build, and focused
  archive E2E passed on the changed source.
- Final visual baselines and release evidence must be regenerated only after
  the concurrent homepage, chrome, and product-world workstreams freeze.
