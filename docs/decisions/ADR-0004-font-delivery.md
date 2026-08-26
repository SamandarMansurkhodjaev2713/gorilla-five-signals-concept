# ADR-0004: Locale-aware static display font

- Status: superseded by ADR-0005
- Date: 2026-07-27
- Last verified: 2026-07-28

## Context

Unbounded and Onest must render Uzbek Latin, Russian Cyrillic, product names,
units, and legal copy without third-party runtime requests. Unrestricted
variable fonts exceeded the first-view budget. The display face also caused
visual instability and measurable layout work when it swapped after first
paint.

## Decision

- Self-host both OFL families and their complete license texts.
- Ship Unbounded as a deterministic static weight 800, split into Latin
  Extended and Cyrillic subsets.
- Ship Onest as a variable 100–900 text face, split into the same script groups.
- Select subsets with `unicode-range`; each locale fetches only its display and
  text pair.
- Use `font-display: block` for Unbounded. The display subset is small, local,
  preloaded, and used for the identity-defining headings; a short block avoids
  a late geometry change.
- Keep Onest independent of animation and preserve system fallbacks. Semantic
  content remains present in server HTML even if a font request fails.
- Generate the files reproducibly with `scripts/build-fonts.py`, the exact
  project corpus, `recalcTimestamp=False`, and only the required Unbounded
  layout closure.

Measured uncompressed artifacts:

| Locale/script       | Unbounded |    Onest |     Pair |
| ------------------- | --------: | -------: | -------: |
| Uzbek/English Latin |  22,592 B | 49,448 B | 72,040 B |
| Russian Cyrillic    |  24,144 B | 43,328 B | 67,472 B |

Both locale pairs remain comfortably below the 140 KiB first-view font budget.

## Alternatives rejected

- `optional` made the defining display typography non-deterministic across
  cached and uncached sessions and produced flaky visual baselines.
- `swap` introduced a visible metric transition and avoidable layout/main-thread
  work in repeated Lighthouse runs.
- Waiting on `document.fonts.ready` would hide or delay semantic content and is
  prohibited.

## Consequences

Display typography intentionally uses one authored weight. Onest keeps its
variable range because body, UI, data, and legal roles genuinely use several
weights. Any new glyph or copy requires deterministic subset regeneration,
checksum refresh, provenance review, visual regression, and budget
verification.

## Five-lens review

1. Correctness: supported scripts, punctuation, Uzbek apostrophes, product
   names, and units are generated from the exact localized corpus.
2. Architecture: upstream sources stay outside deployment; generated files and
   license texts have stable paths.
3. UX/accessibility: server content never depends on font JavaScript, while the
   defining display face avoids a late geometric swap.
4. Performance/security: no external font origin exists; both locale pairs are
   below budget and passed median-of-three Lighthouse.
5. Maintainability/release: generation is deterministic, hashes are verified,
   and every shipped license is recorded.
