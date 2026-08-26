# Signal / Industrial Editorial design system

## Status and ownership

This document is the production source of truth for visual decisions. Component-level CSS may consume its semantic tokens but must not redefine the palette, type scale, motion language, grid, or layer model locally.

The selected territory is **Signal / Industrial Editorial**. It is deliberately not a hybrid with the rejected Night Print direction.

## Creative invariant

The memorable mechanism is a tuning system:

> Five products are five distinct signals carried by one industrial instrument.

The interface alternates between two modes:

1. **stage** — near-black, overscale type, product material and one active signal;
2. **instrument** — mineral paper, exact product truth, comparison and task controls.

This contrast prevents an undifferentiated dark “gaming” site. Dense kinetic moments are followed by still, precise reading surfaces. If a composition still works unchanged for sneakers, crypto, or an agency portfolio, it is not specific enough.

## Non-negotiable exclusions

- no glassmorphism;
- no generic neon cyberpunk wallpaper;
- no custom cursor;
- no infinite marquee;
- no smooth-scroll library or scroll hijacking;
- no glow as the primary depth device;
- no all-caps body copy;
- no flavor color as the only selected-state cue;
- no copied reference composition, can placement, timing, masking, or section rhythm;
- no motion that delays a task or keeps moving while supporting copy is read.

## Color system

### Approved marker values

| Token                     |     Value | Role                                     |
| ------------------------- | --------: | ---------------------------------------- |
| `--color-brand-lime`      | `#91D401` | master Gorilla signal and primary action |
| `--color-marker-original` | `#92D400` | Original identifier                      |
| `--color-marker-zero`     | `#969696` | Zero identifier                          |
| `--color-marker-extra`    | `#8D745A` | Extra identifier                         |
| `--color-marker-tropical` | `#F5B01D` | Mango–Coconut identifier                 |
| `--color-marker-lychee`   | `#FF3E6F` | Lychee–Pear identifier                   |

Marker values identify products; they do not become unrestricted foreground colors. Features consume `--flavor-signal`, `--flavor-on-signal`, `--flavor-surface`, and `--flavor-border`.

### Neutral and semantic values

| Token                         |     Value | Use                                      |
| ----------------------------- | --------: | ---------------------------------------- |
| `--color-ink-950`             | `#050605` | primary stage and text on bright signals |
| `--color-ink-900`             | `#0B0D0B` | raised dark surface                      |
| `--color-ink-850`             | `#111411` | soft layer separation                    |
| `--color-paper-50`            | `#F4F4ED` | high-contrast text and reading surface   |
| `--color-paper-100`           | `#E9EAE2` | secondary paper surface                  |
| `--color-text-secondary`      | `#B6BCB1` | supporting text on ink                   |
| `--color-text-muted-on-paper` | `#4E554C` | supporting text on paper                 |
| `--color-focus-on-dark`       | `#57C7FF` | keyboard focus on dark                   |
| `--color-focus-on-light`      | `#005A7D` | keyboard focus on paper                  |
| `--color-status-danger`       | `#FF5B5B` | invalid/error state with text or icon    |

Lime is not used as body text on paper. Focus blue is intentionally independent of all flavor signals so keyboard state cannot be confused with product state.

### Verified contrast math

Ratios use WCAG relative luminance:

```text
L = 0.2126 R + 0.7152 G + 0.0722 B
contrast = (Llighter + 0.05) / (Ldarker + 0.05)
```

| Foreground / background                      |     Ratio | Result                    |
| -------------------------------------------- | --------: | ------------------------- |
| paper `#F4F4ED` / ink `#050605`              | `18.37:1` | AAA                       |
| secondary `#B6BCB1` / ink `#050605`          | `10.45:1` | AAA                       |
| muted paper text `#4E554C` / paper `#F4F4ED` |  `6.97:1` | AA, AAA large             |
| brand lime `#91D401` / ink `#050605`         | `11.23:1` | AAA                       |
| Original `#92D400` / ink `#050605`           | `11.25:1` | AAA                       |
| Zero `#969696` / ink `#050605`               |  `6.86:1` | AA                        |
| Extra `#8D745A` / ink `#050605`              |  `4.62:1` | AA; do not reduce opacity |
| Mango–Coconut `#F5B01D` / ink `#050605`      | `10.74:1` | AAA                       |
| Lychee–Pear `#FF3E6F` / ink `#050605`        |  `5.96:1` | AA                        |
| focus blue `#57C7FF` / ink `#050605`         | `10.65:1` | AAA                       |
| dark focus `#005A7D` / paper `#F4F4ED`       |  `6.89:1` | AA                        |
| danger `#FF5B5B` / ink `#050605`             |  `6.67:1` | AA                        |

Opacity, blend modes, video, and gradients can reduce real contrast. Text over media requires an opaque semantic scrim and must be remeasured from the rendered frame. `Extra` is the tightest approved pair and may never be animated through lower opacity when it carries text or a control boundary.

### Flavor themes

| Flavor        | Surface behavior                   | Material cue                                | Type rhythm          | Selection cue                           |
| ------------- | ---------------------------------- | ------------------------------------------- | -------------------- | --------------------------------------- |
| Original      | black + lime axis                  | laser-etched micro grid                     | firm, centered lock  | name, filled marker, check icon         |
| Zero          | black + mineral gap                | brushed cool aluminum                       | wide negative space  | name, outlined `ZERO`, check icon       |
| Extra         | deep petrol-black + bronze density | compressed cross-hatch with one orange edge | tighter block rhythm | name, filled bronze rail, check icon    |
| Mango–Coconut | dark cyan-black + warm diagonal    | cool/warm laminated split                   | stepped diagonal     | full flavor name, warm rail, check icon |
| Lychee–Pear   | black + rose refraction            | controlled soft scan                        | offset paired lines  | full flavor name, rose rail, check icon |

These are graphic identities, not claims about a drink’s effect.

The official packshots are deliberately multicolor: Original and Zero share the black/lime family; Extra combines deep petrol, bronze and orange; Mango–Coconut combines cyan/blue, orange, lime and white; Lychee–Pear combines magenta, yellow, green and white. The interface does not promote every package color into a global token. The complete packshot carries packaging truth; the surrounding UI uses one marker plus one dark supporting surface so all five states still belong to one system.

## Typography

### Production choice

- **Display:** Oswald Variable, weights `200–700`;
- **text, UI, legal and data:** Onest Variable, weights `400–700` from the
  shipped `100–900` range.

Oswald creates the condensed, high-pressure editorial signal required by the
final art direction. Onest keeps Uzbek Latin, Russian Cyrillic, tables,
warnings, and controls readable. Display roles never request a weight above
Oswald's shipped maximum of `700`.

The release sources are the exact `5.3.0` packages pinned in `devDependencies`:

- `@fontsource-variable/oswald`;
- `@fontsource-variable/onest`.

License files must ship with the font artifacts or the repository’s license notices. Subsetting does not change the OFL obligations.

### Loading plan

Fonts are self-hosted. Runtime requests to Google Fonts are prohibited.

Generated artifacts:

```text
public/fonts/
├── font-manifest.json
├── licenses/
│   ├── Onest-OFL.txt
│   └── Oswald-OFL.txt
├── onest/
│   ├── onest-cyrillic-variable.woff2
│   └── onest-latin-variable.woff2
└── oswald/
    ├── oswald-cyrillic-variable.woff2
    └── oswald-latin-variable.woff2
```

Build policy:

1. copy artifacts only from the two exact package versions, never from a
   network request or unknown converter;
2. regenerate `font-manifest.json` and require byte-for-byte deterministic
   output across consecutive builds;
3. compare each output hash with its package source and reject any extra file;
4. verify that every CSS font URL is local and every shipped WOFF2 is referenced;
5. let unicode ranges select Latin and Cyrillic; Russian pages may request both
   because product names and identifiers contain Latin characters;
6. do not preload without route-level LCP evidence;
7. preserve `font-display: swap`, metric-safe fallbacks, and semantic server HTML;
8. keep each locale total below `140 KiB` with at least ten percent headroom;
9. rerun glyph-corpus and fallback screenshots after a package-version change.

`src/styles/typography.css` encodes these paths and unicode ranges. The four
artifacts and both OFL notices are present. Their generation and checksums are
recorded in ADR-0005 and the asset provenance ledger; rendered glyph and
fallback screenshots remain part of visual QA.

### Required specimen corpus

```text
Uzbek:
BESH HOLAT. BIR INSTINKT.
Oʻzbekiston bo‘ylab ta’mni tanlang
Gʻalaba emas — aniq mahsulot ma’lumoti

Russian:
ПЯТЬ СОСТОЯНИЙ. ОДИН ИНСТИНКТ.
Выберите вкус и сравните состав

Products and data:
ORIGINAL · ZERO · EXTRA
MANGO–COCONUT · LYCHEE–PEAR
0% · 250 ml · 30 mg/100 ml · № 05
```

Check both U+02BB modifier letter turned comma and typographic apostrophe inputs. Content normalization belongs at the content boundary; the font must render both deliberately supported forms.

### Type roles

| Role        | CSS class        | Size              | Weight | Use                                       |
| ----------- | ---------------- | ----------------- | -----: | ----------------------------------------- |
| Signal      | `.type-signal`   | `68–288 px` fluid |  `700` | cropped scene numeral or one short phrase |
| Display     | `.type-display`  | `52–192 px` fluid |  `700` | hero and section keyframe                 |
| Title       | `.type-title`    | `40–120 px` fluid |  `700` | section heading                           |
| Title small | `.type-title-sm` | `28–48 px` fluid  |  `700` | card/product heading                      |
| Body large  | `.type-body-lg`  | `17–20 px`        |  `450` | lead                                      |
| Body        | base             | `16 px`           |  `450` | prose and UI explanation                  |
| Label       | `.type-label`    | `12 px`           |  `700` | short metadata only                       |
| Data        | `.type-data`     | context           |  `600` | nutrition, units and comparison           |
| Legal       | `.type-legal`    | `15 px`           |  `450` | warnings and legal copy                   |

Rules:

- display line-height may reach `0.84`; glyphs must not be clipped;
- body and legal text never use Oswald;
- all-caps is limited to short display, labels, product names and controls;
- long headings wrap; they are never truncated;
- body measure is `68ch`, compact measure `48ch`;
- tables use tabular lining numbers;
- text remains real HTML, not baked into image or video;
- 200% zoom and WCAG text-spacing overrides must not overlap or hide controls.

## Responsive grid

### Global composition

| Range       | Columns |           Gutter | Typical composition                              |
| ----------- | ------: | ---------------: | ------------------------------------------------ |
| `320–599`   |       4 | `16–24 px` fluid | single reading rail, deliberate full bleed media |
| `600–1023`  |       8 | `20–32 px` fluid | 4/4 or 3/5 split                                 |
| `1024–1439` |      12 | `24–36 px` fluid | 5/7 or 4/8 asymmetric stage                      |
| `1440+`     |      12 | `32–40 px` fluid | capped at `1792 px`, controlled overscale type   |

The ranges are composition changes, not device names. Local components use container queries when their behavior depends on available space.

### Grid rules

- semantic DOM and focus order follow the compact vertical flow;
- desktop overlap is visual only and must not reorder reading;
- full-bleed media exits the grid while its caption stays on it;
- no negative inline margin may create page-level overflow;
- stage scenes use `min-block-size: 100svh`; never rely on `100vh`;
- controls respect safe-area insets;
- a fixed element reserves its occupied space;
- landscape phones use the compact content order with reduced vertical pinning.

## Spacing and geometry

Spacing follows a compact 4/8 rhythm:

```text
4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px
```

Section spacing is fluid from `80 px` to `192 px`. Tightness comes from typography and hard crops, not from cramped control groups.

Geometry:

- stage panels: `0 px` radius;
- controls: `2 px` radius;
- pills: reserved for compact status or product filter chips;
- borders: `1 px` structural, `2 px` focus/emphasis;
- no floating card shadows;
- depth comes from crop, light, material and overlap;
- adjacent touch targets retain at least `8 px` separation.

## Material system

### Ink

The stage is not flat #000. It uses `#050605`, sparse 1–2% top light and physically plausible falloff. Large pure-white surfaces are avoided in cinematic scenes to reduce visual glare.

### Mineral paper

Product truth and legal scenes use `#F4F4ED`. It is an editorial interruption that signals “read this exactly.” Lime becomes a block or rule, never low-contrast text.

### Metal

Metal is made from approved product renders or a restrained named gradient. A light sweep may cross once when product state changes. It does not loop.

### Grain and scan

- grain opacity: `0.035` maximum;
- scan overlay opacity: `0.08` maximum;
- overlays are pointer-transparent and removed in forced-colors/more-contrast;
- never put animated noise on body text;
- procedural grain must not create a large raster request;
- a scan is directional evidence of selection, not ambient decoration.

### Flavor materials

Each flavor may add one unique material layer. It may not replace the common ink/metal/paper structure, otherwise the site becomes five unrelated campaigns.

## Control contracts

All interactive elements use semantic HTML first. `.control`, `.text-link`, and `.field` supply the shared visual states.

| State         | Required visual and semantic behavior                                      |
| ------------- | -------------------------------------------------------------------------- |
| default       | clear boundary or underline; action label; valid accessible name           |
| hover         | signal fill/scan on fine pointer only; never exposes unique content        |
| focus-visible | independent blue 2 px ring, 4 px offset; no layout shift                   |
| pressed       | 1 px pressure response, ≤80 ms; state remains legible                      |
| selected      | signal fill + text/icon + `aria-pressed` or `aria-selected`                |
| disabled      | semantic `disabled` where supported; muted but readable; no pointer action |
| loading       | disabled repeat submission; visible label remains; status announced        |
| success       | lime state + explicit success text; not color-only                         |
| error         | danger border + adjacent message + error summary where relevant            |

### Button hierarchy

- one primary action per decision surface;
- primary uses brand lime and ink text;
- secondary is outlined;
- tertiary is a text link with finite underline scan;
- destructive actions never use flavor color;
- icon-only controls require a visible tooltip on hover/focus and an accessible name;
- minimum target `44 × 44 CSS px`, with `48 px` preferred on dense mobile sheets.

### Product selector

Selection uses four simultaneous signals:

1. product name;
2. marker/color;
3. position or filled boundary;
4. check/selected semantics announced to assistive technology.

No drag-only, swipe-only or hover-only product selection is allowed.

### Disclosure

Use native `details/summary` for server-rendered FAQ where feasible. Enhanced animation may only follow the semantic open state. Warning content is not collapsed by default.

### Tables

- real `table`, `caption`, `th`, `scope`;
- sticky headers never cover focused cells;
- flavor marker appears with the product name;
- missing data reads “Not yet verified”;
- mobile comparison defaults to two products;
- any overflow region is labelled, focusable only when overflow exists, and does not propagate to the page.

### Form fields

- visible label, optional hint, error association and status region;
- body input remains at least `16 px` on mobile;
- no placeholder-only labels;
- busy buttons prevent duplicate submission;
- input state never depends on animation.

## Layer model

| Token           | Value | Owner                                             |
| --------------- | ----: | ------------------------------------------------- |
| `--z-below`     |  `-1` | owned decorative background inside isolated scene |
| `--z-base`      |   `0` | surface                                           |
| `--z-media`     |  `10` | scene media                                       |
| `--z-content`   |  `20` | scene copy and controls                           |
| `--z-sticky`    |  `40` | local sticky element                              |
| `--z-header`    |  `60` | site header                                       |
| `--z-overlay`   |  `80` | menu/scrim                                        |
| `--z-dialog`    | `100` | modal dialog                                      |
| `--z-toast`     | `120` | status feedback                                   |
| `--z-skip-link` | `140` | keyboard escape                                   |

No feature invents `9999`. Negative layers require an isolated parent and may not disappear behind the page.

## Accessibility modes

### Reduced motion

The same hierarchy, product state, warnings and actions remain. Spatial transitions, parallax, scrubbed rotation, long pinning and autoplay film are removed. A short opacity change is allowed only where it clarifies a state change.

### More contrast

Texture disappears, borders strengthen, secondary text remains at least AA, and selected state uses an explicit symbol. Video-backed text receives an opaque surface.

### Forced colors

System colors own text, borders and focus. Material decoration disappears. Product names remain visible so flavor meaning survives loss of marker colors.

### Reduced data

System fallbacks are permitted, poster replaces video, and no below-fold media is prefetched. Product information and conversion stay complete.

## Acceptance checklist

- every raw color appears only in this token layer or an approved media asset;
- all text/background pairs are measured from rendered states;
- the four font subsets exist, are licensed, checksum-recorded and within budget;
- Uzbek and Russian specimen screenshots are approved;
- 320 px and 200% zoom show no clipping;
- every control state is visible in dark, paper, flavor and forced-color contexts;
- no page-level horizontal overflow;
- focus is never obscured by sticky UI;
- flavor remains identifiable without color;
- grain, scan and motion stop under their accessibility policies.
