# ADR-0005: Package-pinned variable font delivery

- Status: accepted
- Date: 2026-08-02
- Supersedes: ADR-0004

## Context

The final editorial direction uses a condensed, high-impact display face rather
than the wide display face selected during foundation work. The runtime had
already moved to Oswald, while the design system, provenance ledger, generated
artifacts, and release notices still described Unbounded. That drift made the
build non-reproducible and made the release evidence inaccurate.

The site must render Uzbek Latin, Russian Cyrillic, product data, and legal copy
without a third-party runtime request. Font generation must also work on a clean
checkout without relying on ignored local source files or unpinned converters.

## Decision

- Use Oswald Variable `200-700` for display roles and Onest Variable `100-900`
  for text, UI, legal, and data roles.
- Pin both source packages to version `5.3.0` in `devDependencies`.
- Copy only the package-owned Latin and Cyrillic WOFF2 artifacts and exact OFL
  notices through `scripts/build-fonts.py`.
- Treat `public/fonts/font-manifest.json` as a deterministic generated record of
  source package, version, byte size, and SHA-256 for every shipped artifact.
- Verify the generated directory against an exact recursive allowlist, compare
  each artifact with its pinned package source, reject unused WOFF2 files, and
  reject external font origins.
- Use `font-display: swap` with metric-compatible system fallbacks. Do not delay
  semantic content or animation initialization on `document.fonts.ready`.
- Do not preload a font until route-level performance evidence shows a net LCP
  benefit without wasting bytes. CSS discovery and unicode ranges remain the
  default delivery path.
- Enforce a 140 KiB locale font budget with at least ten percent headroom.

## Measured delivery

| Locale/script                      |   Oswald |    Onest | Browser request total |
| ---------------------------------- | -------: | -------: | --------------------: |
| Uzbek/English Latin                | 28,488 B | 32,236 B |              60,724 B |
| Russian Cyrillic plus shared Latin | 44,176 B | 46,464 B |              90,640 B |

The Russian total includes both Cyrillic and Latin subsets because localized
pages contain Latin product names and identifiers. Both totals retain more than
the required ten percent headroom below 140 KiB.

## Alternatives rejected

- Keeping Unbounded would preserve obsolete documentation at the cost of the
  approved condensed editorial direction.
- Downloading upstream binaries during the build would introduce network and
  mutable-source risk.
- Retaining ignored source fonts would prevent a clean checkout from reproducing
  deployment artifacts.
- Preloading all locale subsets would waste bytes; preloading one guessed subset
  would require locale-specific head logic without current performance proof.
- `font-display: block` would hide identity-defining copy and make first paint
  dependent on a font request.

## Consequences

Display roles cannot request weight `800`; Oswald's shipped variable range ends
at `700`. Updating either font package is a reviewed supply-chain change that
requires regeneration, hash and license review, locale screenshots, visual
regression, and budget verification. The previous decision remains in history
as ADR-0004 but is no longer the runtime contract.

## Five-lens review

1. Correctness: the verifier compares outputs to exact pinned package files and
   rejects missing, additional, unused, or externally hosted font artifacts.
2. Architecture: package sources, deterministic generation, CSS declarations,
   provenance, and release notices have one explicit contract.
3. UX/accessibility: semantic text paints with a system fallback, scripts are
   covered by unicode ranges, and no interaction waits for font JavaScript.
4. Performance/security: there is no font CDN, locale totals retain budget
   headroom, and speculative preloads require evidence before adoption.
5. Maintainability/release: versions, hashes, byte sizes, licenses, and generated
   paths are machine-verifiable from a clean checkout.
