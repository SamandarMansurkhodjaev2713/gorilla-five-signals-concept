# ADR-0002: React SPA frontend foundation

- Status: superseded by ADR-0003
- Date: 2026-07-26

## Original decision

The initial product-agnostic concept selected Vite, React, strict TypeScript, and GSAP.

## Why it was superseded

After the Gorilla direction was selected, the content model expanded to indexable product routes, three locales, legal pages, structured product data, and a requirement for usable HTML without client JavaScript.

A site-wide React runtime would add hydration cost without creating product value. Cross-section choreography can be coordinated through an isolated page-level motion runtime without turning the content layer into a SPA.

See [ADR-0003](ADR-0003-static-first-frontend.md).
