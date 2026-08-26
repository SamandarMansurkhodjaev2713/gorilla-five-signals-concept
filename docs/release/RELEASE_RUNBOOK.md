# GitHub Pages release and rollback runbook

- Release model: immutable static Astro artifact deployed by GitHub Actions
- Public repository: `SamandarMansurkhodjaev2713/gorilla-five-signals-concept`
- Canonical origin: `https://samandarmansurkhodjaev2713.github.io`
- Deployment base: `/gorilla-five-signals-concept`
- Updated: 2026-08-26

## Preconditions

1. Frozen install, source quality gates, and the public base-path build pass.
2. Content, media, font, license, dependency, and provenance evidence is current.
3. The source tree contains no ignored research, source masters, secrets,
   personal data, or private hosting configuration.
4. The exact validated commit is pushed to `main`.
5. Public messaging describes this as an independent review concept, not an
   official or completed commercial launch.

## Candidate build

```text
pnpm install --frozen-lockfile
pnpm quality
PUBLIC_RELEASE_MODE=public
PUBLIC_SITE_ORIGIN=https://samandarmansurkhodjaev2713.github.io
PUBLIC_BASE_PATH=/gorilla-five-signals-concept
pnpm build
```

The Pages workflow repeats this build from the exact pushed commit, uploads
`dist`, and deploys through the protected `github-pages` environment. Generated
`dist` output is never committed.

## Post-deploy smoke

- the project root reaches the Uzbek route;
- Uzbek, Russian, English, one product, compare, locator, legal, and 404 routes
  resolve under the repository base;
- fonts, product images, posters, film sources, favicon, and manifest return
  successfully from the base path;
- canonical, hreflang, robots, sitemap, Open Graph, and social image use the
  Pages origin and repository base;
- responsible entry, mobile menu, locale switching, motion preferences,
  keyboard focus, and reduced motion remain functional;
- the browser console has no application error or unexpected asset 404.

## Hosting boundary

GitHub Pages does not consume `public/_headers`. The document-level CSP and
referrer fallbacks remain valid, but response-level HSTS, permissions policy,
content-type hardening, and cache policy are platform responsibilities and must
not be reported as application-controlled evidence.

## Rollback

1. Identify the last successful Pages workflow and its exact source commit.
2. Revert the defective change with a new commit; do not rewrite public history.
3. Push the revert to `main` and wait for both Quality and Pages workflows.
4. Repeat the route, asset, metadata, responsible-entry, and console smoke.
5. Record the defect, affected commit, revert commit, operator, and verification.

If Pages itself is unavailable, keep the repository public, record the provider
incident, and use the last known deployment only after the platform recovers.

## Monitoring

For 72 hours after a release presented as portfolio-final, review route and
asset 404s, privacy-safe client errors, Core Web Vitals, content corrections,
and accessibility reports. Safety, legal, security, or broken primary
navigation defects trigger immediate rollback.
