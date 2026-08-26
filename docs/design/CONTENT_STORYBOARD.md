# Content storyboard

- Version: 1.0
- Source copy: `docs/content/COPY_DECK.md`
- Product truth: `docs/content/CLAIM_TRUTH_TABLE.md`
- Routes: `/uz`, `/ru`, `/en` plus locale-equivalent child routes

This storyboard defines content order and narrative handoff. It does not define
pixel measurements or animation implementation. Semantic order is identical in
full, lite, reduced-motion, and no-JavaScript modes.

## Narrative spine

```text
adult context
  → recognize five-product range
  → inspect each product
  → verify facts
  → compare
  → search for availability
  → resolve questions/contact
```

Every scene must either advance that spine or be removed. Film and culture are
supporting breaths; they cannot interrupt product choice.

## Persistent layers

### Responsible entry

- First heading: `entry.title`.
- Supporting text: `entry.body`, `entry.privacy`.
- Actions: `entry.confirm`, `entry.leave`.
- Warning is visible in the entry or immediately after it, using the approved
  legal string.
- Confirmation writes session-only state.
- Failure/no JS: the page content remains visible with the adult-context notice
  at its start; content is not made inaccessible behind script.

### Header

Reading/focus order:

1. skip link;
2. brand home link;
3. primary navigation;
4. locale switcher;
5. motion preference;
6. mobile menu control when applicable.

The selected product signal may change visual accent but never changes link
labels or order.

### Warning rail

- Appears after responsible entry, on every product page, near the locator CTA,
  and in the footer.
- It is regular HTML text, never part of a video or image.
- It cannot be dismissed permanently.
- On compact viewports it wraps naturally; no marquee.

## Homepage storyboard

### H00 — Hero / “five products, one signal”

**Content job**

Establish product range and expose both key actions within the first viewport.

**Semantic order**

1. `home.hero.eyebrow`;
2. `home.hero.title`;
3. `home.hero.body`;
4. five-product selector with accessible selected state;
5. `home.hero.primaryCta`;
6. `home.hero.secondaryCta`;
7. meaningful product image or decorative material film;
8. media pause/play control if motion lasts more than five seconds.

**Desktop composition**

- Headline occupies the dominant editorial plane.
- Selected can is the product anchor.
- Five direct product labels remain visible; pointer movement may preview but
  click/focus establishes selection.
- CTA pair remains independent from the media layer.

**Mobile composition**

- Text and primary action precede the can in DOM and visual reading order.
- Product selector is a horizontally compact tab list only if it remains fully
  keyboard-operable; otherwise use a two-row button group.
- The can is capped below the action so it cannot push the CTA off-screen.
- No pointer tilt or drag-only selection.

**Reduced/no-JS**

- Original is the selected static product.
- All five product links are present.
- Poster replaces video and contains no text essential to understanding.

**Exit**

Primary CTA targets `#range`; secondary CTA targets `/{locale}/find`.

### H01 — Range manifesto

**Content job**

Explain the system without making a product-effect promise.

**Content**

- `home.range.eyebrow`;
- `home.range.title`;
- `home.range.body`;
- five names, each linked to its detail route.

**Desktop**

Five typographic bands resolve into one aligned range. Motion stops before body
copy becomes the reading target.

**Mobile**

One vertical list; no five-layer sticky stack. Each item includes name and a
short visual-direction label, not a new product claim.

**Reduced/no-JS**

Stacked list with the final locked composition.

### H02 — Product explorer

**Content job**

Let the visitor deliberately choose one of five products.

**Semantic order**

1. section heading and body;
2. direct product controls;
3. selected product name and editorial description;
4. meaningful can image;
5. product-detail link;
6. compare toggle;
7. selection status announcement.

**Desktop**

One stage may be pinned, but native Previous/Next, direct product buttons, and
links remain in normal focus order. Changing product updates the URL fragment or
query state without losing locale.

**Mobile**

Five vertical product cards. Each card is complete without animation. A compact
compare tray appears only after selection and never covers copy.

**Reduced/no-JS**

All five cards render. No content is hidden in an inactive visual layer.

**Exit**

Detail route or compare route with selected product IDs.

### H03 — Product truth / lab

**Content job**

Make the source boundary visible and show only publishable facts.

**Semantic order**

1. `home.lab.eyebrow`;
2. `home.lab.title`;
3. `home.lab.body`;
4. product image;
5. fact definition list;
6. real nutrition table only when approved;
7. warning;
8. package-priority note;
9. source/date record;
10. detail and compare actions.

**Fact behavior**

- `publishable`: render with localized label, value, unit, source and verified
  date.
- `conditional`/`quarantined`: do not render a numeric row.
- Missing facts never become zero.
- A meaningful can image uses the product alternative from the copy deck.

**Mobile**

Image, summary, facts, warning, source, actions. Disclosure groups may organize
long ingredient/nutrition content, but warning and source stay visible.

**Reduced/no-JS**

Identical product truth; only decorative light sweep is removed.

### H04 — Compare bridge

**Content job**

Move from single-product exploration to deliberate comparison.

**Content**

- `home.compare.*`;
- two-product minimum selection state;
- CTA.

The bridge shows no miniature fake table. It links to the complete compare route.

### H05 — Product material film

**Content job**

Provide the cinematic breath without adding a claim.

**Shot/content sequence**

1. aluminum surface;
2. print texture;
3. condensation as material detail;
4. five coloured light traces;
5. five-can silhouette;
6. pack close.

No opening, pouring, holding-to-mouth, or consumption. No headline is burned
into video. `home.film.description` is visible outside the media.

**Desktop**

16:9 poster-first media with visible Pause/Play.

**Mobile**

9:16 or 4:5 art-directed crop. Never download the desktop film as a hidden
duplicate.

**Reduced/data saver/no-JS**

One optimized poster. The film is not requested.

### H06 — Culture invitation

**Content job**

Signal the planned local editorial layer without fabricating a collaboration.

Before a real story is approved, render only `home.culture.*`. Do not show fake
dates, portraits, publication badges, or “coming soon” countdowns.

Once a story exists, its contract is:

- credited adult creator;
- publication date;
- rights/consent record;
- concise standfirst;
- meaningful image;
- visible external-destination label;
- no consumption or implied product-caused success.

### H07 — Find conversion

**Content job**

Complete the primary intent honestly.

**Semantic order**

1. `home.find.eyebrow`;
2. `home.find.title`;
3. `home.find.body`;
4. current product context, if selected;
5. find-route CTA;
6. warning.

No store pin or retailer logo appears in this bridge.

### H08 — FAQ preview

Show the first three high-intent questions:

1. range;
2. product information/package priority;
3. availability.

Answers use native disclosure semantics and remain visible in no-JS output.

### H09 — Contact preview

Route product/retail/media/partnership intent to Contact. Do not render a form in
the homepage.

### H10 — Footer

Content order:

1. closing line `BESH XIL. BIR SIGNAL.` or locale equivalent;
2. warning;
3. route navigation;
4. product links;
5. legal links;
6. official Instagram;
7. relationship disclosure;
8. copyright;
9. motion preference and back-to-top.

## Product index storyboard

### P00 — Range header

- index eyebrow/title/body;
- direct skip link to product list.

### P01 — Five-product grid

Each article contains:

1. product name;
2. product-specific kicker;
3. original editorial body;
4. meaningful can image;
5. detail link;
6. compare control.

Desktop may alternate scale; DOM hierarchy remains one ordered list. Mobile uses
one column. No card link wraps nested buttons.

### P02 — Compare/find close

Two direct actions, warning, and package-priority note.

## Product detail storyboard

### D00 — Product identity

- breadcrumb/back link;
- product kicker;
- one `h1` product name;
- editorial body;
- can image;
- compare and find actions.

### D01 — Verified product information

- fact definition list;
- ingredients;
- nutrition table only after truth gate;
- warning;
- package note;
- source ID and verified date.

No decorative hotspot owns unique information. If hotspots exist, the same
information follows as an ordered list.

### D02 — Adjacent products

Previous/next are based on the stable range order:

```text
Original → ZERO → EXTRA → Mango–Coconut → Lychee–Pear
```

Both visible name and direction are announced; colour alone is insufficient.

## Compare route storyboard

### C00 — Introduction

Title/body and current selected-product summary.

### C01 — Selectors

- two selectors always;
- optional third at desktop;
- duplicate selection produces `compare.sameProduct`;
- URL encodes stable product slugs.

### C02 — Comparison

Rows appear only when at least one selected product has a publishable value.
Rows with no publishable values are omitted. Sticky labels cannot cover content
at 200% zoom.

Mobile defaults to two products and changes one side at a time. If horizontal
scroll is unavoidable, it is contained in a named region with keyboard access;
the page itself never overflows.

### C03 — Actions

Clear, copy-link, detail, and find. Copy failure provides manual fallback.

## Find route storyboard

### F00 — Truthful locator header

Render `find.title`, `find.body`, and Tashkent as the only current city option.
Do not ask for geolocation.

### F01 — Search handoff

- visible no-verified-stores notice;
- Google Maps search link;
- Yandex Maps search link;
- official Instagram link;
- third-party notice;
- warning.

Links are ordinary HTTPS anchors and work without JavaScript. An interstitial
confirmation is unnecessary if the external label and notice are visible.

### F02 — Future verified results

This scene remains absent until retailer records pass the phase-B contract in
`LOCATOR_DATA.md`. Empty scaffolding or fake pins are prohibited.

## Culture route storyboard

Until the first approved story exists:

- one honest empty-state heading/body;
- return-to-products action;
- footer.

The route is excluded from primary navigation and sitemap, but direct access is
coherent. There is no skeleton, fake article, or countdown.

## FAQ route storyboard

### Q00 — Header

One title and short explanation that packaging is the primary current source.

### Q01 — Groups

1. Products: FAQ 01–05;
2. Availability: FAQ 06;
3. Partnerships and brand: FAQ 07–09;
4. Contact: FAQ 10.

Use native `<details>`/`<summary>` or equivalent server-rendered semantics.
Opening one item must not close another unexpectedly. Search is unnecessary for
ten questions.

### Q02 — Contact

Link to Contact and repeat warning.

## Contact route storyboard

### T00 — Topic routing

Header and topic choice appear before any personal-data field.

### T01 — Form, only when configured

Semantic order:

1. error summary;
2. topic;
3. name;
4. email;
5. organisation;
6. message;
7. privacy link and consent;
8. submit;
9. status region.

The form has one submission path, bounded fields, deterministic error/success,
and no attachment in v1.

### T01 fallback — no form adapter

Do not show inputs. Render `contact.fallback.*` and a direct official website
link.

## Legal routes

- Plain reading layout, no pinned scenes.
- Content width targets comfortable legal reading.
- Warning/product information is real text.
- Privacy content matches actual storage, analytics, third-party links, and form
  adapters; it is reviewed whenever one changes.
- Heading hierarchy and last-reviewed date are visible.

## 404

One `h1`, concise reason, product-range CTA, locale-safe navigation. Motion is a
single finite signal loss/recovery; reduced mode renders the final state.

## Content QA gates

Before a route is enabled:

- UZ/RU/EN semantic IDs have exact parity;
- every fact links to a publishable claim/source;
- every meaningful image has three alternatives;
- every external link has an explicit destination;
- no user journey ends on an unimplemented control;
- no legal warning is embedded only in media;
- text reflows at 320 px and 200% zoom;
- visual movement stops before long copy becomes the reading target;
- no copy implies consumption, minors, sport success, or physical/mental effect.
