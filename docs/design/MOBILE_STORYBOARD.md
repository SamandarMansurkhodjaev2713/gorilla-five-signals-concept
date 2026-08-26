# Mobile storyboard

## Purpose

Mobile is an independently authored vertical edit of the Signal / Industrial Editorial concept. It is not the desktop canvas squeezed into one column.

Reference viewport for composition: `390 × 844`. Mandatory extremes:

- `320 × 568`;
- `360 × 800`;
- `390 × 844`;
- `430 × 932`;
- `768 × 1024`;
- phone landscape at `844 × 390`.

The DOM order below is the semantic order for every viewport. Desktop may overlap elements visually but may not change it.

## Global mobile rules

- native vertical scroll;
- no page-level horizontal overflow;
- no horizontal product carousel;
- no smooth scroll, scroll hijack, custom cursor or infinite marquee;
- at most one short sticky behavior per scene;
- total mobile pin distance in a scene is capped at `150svh`;
- primary content and at least one action appear without waiting for animation;
- controls are at least `44 × 44 px`, preferably `48 px`;
- sticky header and action rails respect safe areas and never cover focus;
- `svh` defines authored scenes, `dvh` may improve live viewport fill;
- video is poster-first and optional;
- Lite is the default touch choreography; Reduced is fully composed, not merely “animation off.”

## Persistent frame

### Header

Height is `64 px` compact and `72 px` medium, plus the safe-area inset.

```text
┌────────────────────────────────────┐
│ LOGO              UZ       MENU    │
└────────────────────────────────────┘
```

- dark opaque base after the hero’s first 24 px;
- locale is a real route-preserving control;
- menu target sits away from the right system gesture edge;
- menu opens as a vertical editorial cut, not a scale-from-icon trick;
- close occupies the same spatial anchor;
- focus returns to the menu button;
- motion setting is reachable in the menu and footer.

### Reading rail

Main content uses `16–24 px` fluid gutters. Full-bleed product media may touch the viewport edge, but controls, facts, warnings and captions stay on the reading rail.

## Scene 00 — responsible entry

### First frame

```text
┌────────────────────────────────────┐
│                                    │
│  18+ / RESPONSIBLE INFORMATION     │
│                                    │
│  Approved warning, 3–5 lines       │
│  at normal readable size           │
│                                    │
│  [ CONTINUE ]                      │
│  [ LEAVE ]                         │
│                                    │
│  UZ  RU                            │
└────────────────────────────────────┘
```

- content begins at safe-area + `32 px`;
- dialog scrolls only if text genuinely exceeds `568 px` height;
- continue is never blocked by a scan;
- the approved warning is real text;
- successful confirmation moves focus to the page heading.

Lite: one `160 ms` block reveal.

Reduced: final frame immediately.

## Scene 01 — navigation

The open menu is a semantic dialog or disclosure according to the final navigation architecture.

```text
┌────────────────────────────────────┐
│ LOGO                        CLOSE  │
├────────────────────────────────────┤
│ 01 PRODUCTS                       │
│ 02 COMPARE                        │
│ 03 FIND                           │
│ 04 CULTURE                        │
│ 05 FAQ                            │
│                                    │
│ UZ / RU          MOTION: LITE      │
└────────────────────────────────────┘
```

Number, label and active route form one link. No decorative image loads inside the menu.

## Scene 02 — hero

### Composition

```text
┌────────────────────────────────────┐
│ HEADER                             │
│                                    │
│ FIVE STATES                        │
│ OF INSTINCT                        │
│                       01 / 05      │
│            ┌──────────┐            │
│            │   CAN    │  40–44svh  │
│            └──────────┘            │
│ ORIGINAL  ZERO  EXTRA  …           │
│ [ EXPLORE RANGE ]                  │
│ Find Gorilla                       │
└────────────────────────────────────┘
```

- meaningful poster and heading are the LCP frame;
- product tabs are horizontally **wrapping or condensed**, never an overflow carousel;
- if five full names cannot fit, use a 2-row list with explicit `01–05`;
- can stays behind type only when contrast remains valid;
- primary action appears above or at the first scroll boundary;
- film/video does not start in the initial mobile viewport.

Lite sequence:

1. headline block resolves in `≤480 ms`;
2. selected signal rail enters once;
3. product poster moves at most `24 px` and stops;
4. tabs and actions are immediately interactive.

Reduced: static poster, heading, all product buttons and actions.

## Scene 03 — range manifesto

Five vertical bands replace the desktop multi-axis lock.

```text
┌────────────────────────────────────┐
│ FIVE STATES                        │ ← short sticky label
├────────────────────────────────────┤
│ 01 ORIGINAL                        │
│ approved neutral descriptor        │
├────────────────────────────────────┤
│ 02 ZERO                            │
│ approved neutral descriptor        │
└────────────────────────────────────┘
```

- scene height target `100–140svh`, hard maximum `150svh`;
- bands read naturally with JS off;
- sticky label releases before the final band;
- no five-layer pinned stack.

Lite: active band gains a finite signal rule as it enters.

Reduced: simple paper list.

## Scene 04 — flavor explorer

Mobile uses a vertical card stack, not horizontal drag.

Each card:

```text
┌────────────────────────────────────┐
│ 03 / 05                   EXTRA    │
│                                    │
│       product still / poster       │
│                                    │
│ flavor name + verified attributes  │
│ [ SELECT EXTRA ]     Product →     │
└────────────────────────────────────┘
```

- a card is complete without animation;
- only one card can become selected;
- selection updates URL, title/status text and comparison tray;
- focus stays on the activated control;
- compact sticky tray appears only after selection and reserves bottom space;
- tray contains product name, Compare and Close; it never hides warning text.

Lite: the selected card receives its one motion signature:

- Original — `24 px` axial lock;
- Zero — one clean opacity/wipe;
- Extra — one `0.98 → 1` pressure pulse;
- Mango–Coconut — one diagonal mask;
- Lychee–Pear — one soft scan.

Reduced: immediate state change with filled boundary, check and status announcement.

## Scene 05 — product lab

Content order:

1. product name and selection status;
2. still/render with declared aspect ratio;
3. short verified summary;
4. warning, open by default;
5. structured fact groups;
6. real nutrition table;
7. product/compare action.

No hotspot is required to discover a fact. If hotspots exist, an ordered text list mirrors them.

Lite: one material light sweep after product change, then complete stillness.

Reduced: no sweep.

## Scene 06 — compare

Default is a two-product comparison.

```text
┌────────────────────────────────────┐
│ COMPARE                            │
│ [ ORIGINAL ▾ ]  [ ZERO ▾ ]         │
├────────────────┬───────────────────┤
│ Flavor         │ values + names    │
│ Sugar status   │ explicit text     │
│ Verified fact  │ value / unknown   │
└────────────────┴───────────────────┘
```

- selectors replace one side at a time;
- sticky row labels are tested against the header;
- table may scroll inside a clearly labelled region only if `320 px` cannot contain it;
- page never scrolls horizontally;
- “Not yet verified” is a valid explicit state;
- difference highlight runs once and does not count up.

## Scene 07 — material film

Poster is the default mobile composition.

```text
┌────────────────────────────────────┐
│ PRODUCT MATERIAL / 00:12           │
│ ┌────────────────────────────────┐ │
│ │            POSTER              │ │
│ └────────────────────────────────┘ │
│ [ PLAY ]  Captions / transcript    │
└────────────────────────────────────┘
```

- `preload="none"`;
- play is explicit on mobile/data saver;
- user can pause at all times;
- leaving visibility pauses;
- route teardown stops and releases media;
- sound remains off unless explicitly enabled.

Reduced uses the poster and an optional finite still sequence controlled by Next/Previous.

## Scene 08 — culture signal

One lead story and a finite chronological list:

```text
date / category
full-bleed licensed image
headline
two-line standfirst
external destination →
```

- no autoplay social embed;
- no endless ticker;
- external links are explicit;
- image crop may shift once in Lite;
- cards never depend on hover.

## Scene 09 — find Gorilla

The accessible list is primary.

```text
┌────────────────────────────────────┐
│ FIND GORILLA                       │
│ [ CITY / AREA                  ▾ ] │
│ [ RETAIL CATEGORY             ▾ ] │
│ [ FIND LOCATIONS ]                 │
│                                    │
│ 12 RESULTS · UPDATED DATE          │
│ 1. Retailer / area   Open maps →   │
│ 2. Retailer / area   Open maps →   │
└────────────────────────────────────┘
```

- map loads only after explicit intent;
- a bottom sheet is not the baseline;
- empty, error, timeout, stale and retry states occupy reserved space;
- loading control prevents duplicate requests;
- result focus moves only after an explicit submit, not passive filtering.

## Scene 10 — FAQ and safety

- native disclosure rows;
- summary target at least `56 px` high;
- grouped by product, safety, availability and contact;
- approved warning precedes or follows the group in normal reading flow;
- no stagger on accordion rows;
- open/close never causes the sticky header to obscure the active summary.

## Scene 11 — contact and partnership

Intent selection precedes fields. One column only.

- persistent visible labels;
- inline errors plus summary;
- input font at least `16 px`;
- submit button exposes idle, loading, success and retry states;
- privacy consent is adjacent to submit;
- no fake form: a verified contact route is the fallback.

## Scene 12 — footer

```text
FIVE SIGNALS → ONE LINE

PRODUCTS     FIND
FAQ          CONTACT
UZ / RU      MOTION

approved warning
company and legal
concept/brand attribution
```

The five finite rules collapse once in Lite. Reduced starts at the final single-line frame.

## Mobile interaction timing

| Interaction                             |                          Duration |
| --------------------------------------- | --------------------------------: |
| press feedback                          |                           `80 ms` |
| hover-equivalent state change after tap | none; selected state is immediate |
| control transition                      |                          `160 ms` |
| disclosure                              |                  `260 ms` maximum |
| local product change                    |                      `260–640 ms` |
| first hero entrance                     |                 `880 ms` hard cap |

Motion never delays semantic state. `aria-selected`, URL and visible label update at activation; a material transition follows.

## Failure and fallback frames

| Failure                    | Mobile result                                        |
| -------------------------- | ---------------------------------------------------- |
| JavaScript unavailable     | all content, links, products, warning and FAQ remain |
| font unavailable           | system fallback, no hidden text, no blocked entry    |
| product render unavailable | reserved poster area with meaningful alt/fallback    |
| video decode fails         | final-quality poster and Play error text             |
| locator unavailable        | verified category/contact/map outbound fallback      |
| reduced data               | static media and no prefetch                         |
| reduced motion             | static authored composition                          |
| landscape short height     | remove sticky/pin; content becomes ordinary flow     |

## Visual QA assertions

- no horizontal page overflow at every matrix width;
- hero CTA is reachable without completing motion;
- all five product names are operable at `320 px`;
- no fixed control covers warning, validation error or focused element;
- 200% zoom preserves a single readable column;
- text spacing overrides do not clip display or labels;
- selected product is identifiable in grayscale;
- portrait and landscape retain full task parity;
- full, Lite and Reduced screenshots represent intentional compositions.
