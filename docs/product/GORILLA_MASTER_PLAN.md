# Gorilla Uzbekistan — master implementation plan

- Status: approved planning baseline
- Date: 2026-07-26
- Delivery mode: independently authored production concept
- Permission basis: project owner confirmed brand and publishing rights on 2026-07-26

## 0. What we are building

An original, awards-caliber product-discovery website for the five-product Gorilla Energy Uzbekistan range.

The work combines:

- expressive Uzbek-first typography;
- product-led narrative and comparison;
- cinematic but purposeful motion;
- separate desktop and mobile direction;
- fast static HTML with progressive enhancement;
- verified local product facts;
- a useful store-intent journey;
- WCAG 2.2 AA accessibility;
- measurable performance and lifecycle safety.

It is not:

- a pixel copy, reskin, or code fork;
- a claim that Gorilla commissioned or operates the site without separate evidence;
- an athlete/performance-success advertisement;
- a showreel that sacrifices product understanding;
- a WebGL demo disguised as a product site;
- a release containing unverified product facts or untraceable assets.

## 1. The quality bar

The target is “awards-level” in craft, not in excess:

- one unforgettable visual thesis;
- sharp editorial hierarchy;
- original interaction grammar;
- no dead sections or template filler;
- motion that reveals product character or state;
- a mobile experience designed as carefully as desktop;
- instant semantic content and resilient fallbacks;
- no accessibility, legal, or performance debt hidden behind polish.

Success is not “more animation.” Success is a visitor remembering the five-product system and completing a real task without friction.

## 2. Authorization and publishing boundary

### Permission status

The project owner confirmed that the required brand and publishing permissions have been obtained and that their legal team owns legal approval. Implementation and release may proceed.

- retain the original legal documents outside Git;
- keep downloaded research assets outside the production tree;
- retain a provenance ledger for every visual and factual source;
- do not imply that Gorilla commissioned or operates the site unless separately documented;
- treat item-level claims, people, and third-party media as independently reviewable.

### Public mode gate

The owner-confirmed permission basis covers implementation and publishing. The release register still records evidence for:

- Gorilla name, wordmark, logo, and trademark;
- packaging and can design;
- photography, video, music, copy, and UGC;
- typeface files and web embedding;
- athlete, rider, model, and creator likeness;
- product claims and nutrition data;
- territory and duration of use;
- permission to publish the case study.

If any individual asset lacks traceable provenance, replace or omit that asset without silently weakening the gate.

### Legal review

The local concept must not show consumption or imply that the drink creates sporting, social, physical, mental, or professional success. Athletes and successful sports figures remain excluded until local advertising counsel explicitly approves a use case.

An age confirmation is a supporting control, not a substitute for compliance. Warning copy, placement, repetition, and social-preview treatment require local legal sign-off.

This plan is a design and engineering plan, not legal advice.

## 3. Product strategy

### Audience

Primary:

- adults 18–34 choosing by flavor, sugar status, and product information;
- adult design, music, street-culture, and nightlife audiences;
- visitors trying to find an official purchase channel;
- retail, distribution, event, media, and partnership contacts.

Excluded:

- minors;
- school/student targeting;
- youth-coded reward mechanics;
- communication based on competitive or personal success.

### Jobs to be done

In one visit, an adult should be able to:

1. recognize that five local variants exist;
2. understand how they differ;
3. inspect approved facts and warnings;
4. choose a variant;
5. find a verified retailer, map destination, or official purchase route;
6. contact the correct business function.

### Conversion model

North star:

```text
product selection → store-search start → verified outbound destination
```

Secondary conversions:

- product-detail reach;
- comparison completion;
- valid B2B inquiry;
- locale switch without abandonment;
- verified social or event destination.

### Non-goals for v1

- e-commerce;
- loyalty or gamification;
- accounts;
- fake stock levels;
- live chat;
- public UGC ingestion;
- a CMS before editorial ownership is proven;
- athlete/rider profiles;
- WebGL as a baseline requirement.

## 4. Creative platform

### Working concept

> FIVE STATES OF INSTINCT

Provisional Uzbek keyframe line:

> BESH HOLAT. BIR INSTINKT.

Each product is a distinct signal with its own rhythm, material, color accent, and spatial behavior. The range is held together by black, mineral white, metal, and the Gorilla lime signal.

The Uzbek line is a direction for professional transcreation, not approved campaign copy.

The user does not scroll through five advertisements. They tune through five states.

### Narrative arc

```text
recognition
  → range reveal
    → personal selection
      → product truth
        → comparison
          → local cultural context
            → find the product
```

### Visual attributes

- kinetic industrial editorial;
- brutal clarity rather than chaotic brutalism;
- overscale display type paired with precise information design;
- matte and metallic surfaces;
- hard crop, scan, strobe-like cut, and directional wipe;
- restrained grain and halftone;
- flavor accents only where they encode the selected product;
- generous silent areas around dense moments.

### Originality rules

Do not copy:

- reference section order;
- headline wording;
- grid measurements;
- can placement;
- carousel behavior;
- transition timings;
- masks, easing combinations, or scroll distances;
- exact typographic scale;
- video shot sequence.

Every section must pass this test:

> If the logo disappeared, would the composition and interaction still belong to this concept?

If the answer is no, redesign it.

## 5. Design system

### Color

Exact RGB, CMYK, and print relationships are not guessed. Semantic tokens are created first and populated only after a verified brand kit and approved package sampling.

Research-only values observed in the current official implementation are:

| Role | Provisional value |
|---|---:|
| brand lime | `#91D401` |
| signal orange | `#FB6119` |
| Original marker | `#92D400` |
| Zero marker | `#969696` |
| Extra marker | `#8D745A` |
| Mango–Coconut marker | `#F5B01D` |
| Lychee–Pear marker | `#FF3E6F` |

These values guide private keyframes only. Production tokens must be replaced or explicitly confirmed from the approved brand kit.

Core roles:

- `surface.ink` — primary stage;
- `surface.paper` — reading and legal layer;
- `surface.metal` — neutral can/material panels;
- `signal.brand` — Gorilla lime;
- `signal.flavor.*` — one approved accent per SKU;
- `text.primary`, `text.secondary`, `text.inverse`;
- `border.subtle`, `border.strong`;
- `focus.visible` — independent from flavor color;
- `status.error`, `status.success`.

Color gates:

- WCAG AA in every resting and animated intermediate state;
- color is never the only selection indicator;
- OLED black smearing and low-brightness mobile conditions are tested;
- wide-gamut color has sRGB fallback;
- gradients are sparse, named, and role-based.

### Typography

Required system:

- `Display Impact`: licensed, assertive, distinctive, Uzbek Latin + Cyrillic;
- `Text Grotesk`: highly readable UI, paragraph, legal, and data face;
- optional custom lettering only for a small campaign phrase, never body content.

First specimen to test:

- Unbounded Variable 700–900 for display;
- Onest Variable 400–700 for text/UI.

They are candidates, not automatic production choices. The final decision still requires glyph, license, subset-size, rhythm, and brand-fit approval. If Unbounded feels too wide or familiar, test a licensed condensed family with full Uzbek/Cyrillic coverage rather than forcing the composition around it.

Type specimen gate:

- Uzbek: `Oʻ`, `Gʻ`, apostrophe variants, diacritics, long words;
- Russian Cyrillic;
- numerals, `%`, `mg`, `ml`, temperature, punctuation;
- all product names;
- warnings at mobile widths;
- 200% zoom and text-spacing override;
- font loading without layout shift.

Working scale:

- fluid, container-aware type with named roles;
- display line-height deliberately tight but never clipped;
- body line length 45–70 characters;
- legal and product facts never condensed for spectacle;
- no text embedded into raster/video when real text can be rendered.

### Grid and spacing

- desktop: 12-column editorial grid;
- tablet: 8 columns;
- compact mobile: 4 columns;
- fluid outer gutters;
- safe-area support;
- component-owned container queries;
- spacing tokens derive from a small modular scale;
- deliberate overlap allowed only when semantic order remains intact.

### Controls

Every control defines:

- default;
- hover;
- focus-visible;
- pressed;
- selected;
- disabled;
- loading;
- success;
- error.

Practical target size is at least 44×44 CSS pixels. Hover never reveals the only way to act.

### Logo and brand mark

Under the confirmed project-level permission:

- no redrawing, stretching, animating letterforms independently, or manufacturing a new “official” lockup;
- official logo use follows the sourced usage rules;
- logo motion is limited to non-destructive reveal/mask treatment;
- independent authorship remains accurately described.

## 6. Information architecture

### Routes

```text
/
  → locale negotiation or explicit Uzbek default
/{locale}
/{locale}/products/{slug}
/{locale}/find
/{locale}/culture
/{locale}/faq
/{locale}/contact
/{locale}/legal/*
/404
```

Initial locales:

- `/uz` — default source locale;
- `/ru` — full parity;
- `/en` — enabled only after complete editorial and legal parity.

### Main navigation

- Products
- Compare
- Find Gorilla
- Culture
- FAQ
- Contact
- Locale
- Motion pause/preferences

On mobile, the menu is a real accessible dialog with focus trap, Escape, focus restoration, background inertness, and visible current location.

## 7. Homepage scene plan

Each scene has a job, visual idea, motion purpose, mobile composition, reduced-motion state, and performance rule.

### Scene 00 — responsible entry

Job:

- establish adult framing, disclaimer, language, and approved warning;
- remember the choice only for an appropriate session duration.

Design:

- instant black page with semantic text and two clear actions;
- no fake countdown;
- no product consumption imagery;
- “continue” never disabled by decorative animation.

Motion:

- fast lime scan revealing the content;
- confirmation compresses into a small persistent legal marker.

Mobile:

- one-screen dialog with safe-area spacing;
- no tiny legal text or nested scrolling unless content truly exceeds viewport.

Reduced:

- immediate opacity state; no scan or spatial compression.

### Scene 01 — navigation and global signal

Job:

- orientation, product access, locale, motion control.

Design:

- compact transparent-to-ink header;
- wordmark/approved logo centered or left according to final balance;
- selected-flavor signal appears as a narrow edge or underline, not a full neon frame.

Motion:

- header responds to direction, not every scroll pixel;
- menu opens as a hard editorial split, not a generic full-screen fade;
- magnetic pointer response is subtle, desktop-only, and never changes hit target.

Mobile:

- stable top bar;
- thumb-reachable close/action;
- no header content hidden behind browser chrome.

### Scene 02 — hero: tune the range

Job:

- communicate “five products, one system” in under five seconds;
- expose the first product action without requiring scroll.

Composition:

- central pre-rendered can silhouette or approved can;
- five product labels arranged as a tuning scale;
- original campaign line and concise range descriptor;
- “Explore the range” and “Find Gorilla” actions.

Signature motion:

1. meaningful poster and headline paint immediately;
2. a sub-900 ms branded entrance aligns five signal bars;
3. the can resolves from metal/light bands;
4. pointer or focus changes a narrow flavor signal, not the whole layout;
5. hero video begins only after LCP and capability approval.

No fake loader. If media is late, the poster is the final-quality state.

Mobile:

- can occupies a controlled 40–48% of viewport height;
- product labels become a native tab/segmented list;
- no pointer-dependent tilt;
- action remains above the first scroll;
- video is optional and poster-first.

Reduced:

- selected static can, visible range list, no parallax/rotation.

### Scene 03 — range manifesto

Job:

- transition from brand recognition to product understanding.

Composition:

- oversized phrase split into five controlled bands;
- each band contains a product name and one approved, non-performance descriptor;
- white editorial surface briefly interrupts the black stage.

Motion:

- bands enter from different axes and lock into one sentence;
- only the selected band remains accented;
- type movement stops before the visitor reads supporting copy.

Mobile:

- vertical sequence with short sticky label, maximum 120–150vh;
- no five-layer pin.

Reduced:

- stacked bands with clear reading order.

### Scene 04 — flavor explorer

Job:

- select a product by flavor and sugar preference.

Desktop:

- one pinned product stage;
- explicit Previous/Next and direct product buttons;
- the can changes through a short masked material cut;
- background accent, texture, and type rhythm change with selection;
- URL state is shareable.

Mobile:

- native vertical cards or controlled snap points;
- each card is fully readable without animation;
- direct buttons, not drag-only;
- no page-level horizontal overflow;
- a compact sticky comparison tray appears after selection.

Motion:

- `Original`: firm vertical lock;
- `Zero`: clean negative-space wipe;
- `Extra`: compressed pulse and harder cut;
- `Mango–Coconut`: warm diagonal split;
- `Lychee–Pear`: refracted soft-edged scan.

These signatures are provisional art direction, not implied product effects.

Reduced:

- immediate content swap with focus management and minimal dissolve.

### Scene 05 — product lab

Job:

- convert spectacle into verified product truth.

Composition:

- large can/render on one side;
- structured data panel: flavor, sugar status, approved caffeine unit, ingredients, volume, nutrition, warning;
- source/version marker in the concept build;
- product detail and compare actions.

Interaction:

- numbered hotspots may reveal packaging details only when evidence exists;
- hotspots are also a semantic ordered list;
- no hover-only disclosure;
- nutrition is a real table.

Motion:

- controlled light sweep maps labels to the data panel;
- no spin that prevents reading;
- product image may tilt by a few degrees on fine pointer only.

Mobile:

- product image, summary, then collapsible detail groups;
- warning never hidden inside a collapsed default;
- sticky action does not cover text.

Reduced:

- still image and visible data.

### Scene 06 — compare five states

Job:

- make a decision without marketing ambiguity.

Design:

- choose up to three products;
- compare only verified dimensions;
- sticky row/column labels;
- sugar status and flavor category are explicit text;
- missing or unapproved data displays “Not yet verified,” never invented values.

Motion:

- selection causes columns to lock into alignment;
- differences highlight once, then stop;
- no animated counting for static facts.

Mobile:

- two-product comparison by default;
- selector changes one side at a time;
- horizontal table only inside a labeled, keyboard-operable region if unavoidable;
- page itself never overflows.

### Scene 07 — product material film

Job:

- create the cinematic awards moment while keeping product claims neutral.

Shot plan:

1. macro aluminum;
2. print texture and condensation;
3. five color signals passing over the surface;
4. silhouette lineup;
5. pack close without opening or drinking.

Motion:

- short, soundless, loop-safe edit;
- optional user-initiated sound only if original/licensed audio exists;
- Pause/Play is persistent;
- captions/transcript for meaningful speech.

Loading:

- poster first;
- `preload="none"` below fold;
- mobile and desktop crops;
- pause outside viewport;
- unload/stop when route changes.

Reduced/data saver:

- poster sequence or one still.

### Scene 08 — culture signal

Job:

- connect the brand to adult contemporary Uzbekistan without implying product-caused success.

Content:

- commissioned/local-licensed editorial work in music, design, street art, or night culture;
- no athletes until legal approval;
- no minors;
- no consumption;
- every person has consent and usage scope.

Design:

- one strong editorial story, not a stale news grid;
- story cards alternate image, type, and date;
- explicit external destination when applicable.

Motion:

- image crop shifts within a fixed frame;
- typographic ticker is finite and pauses;
- no endless marquee competing with reading.

Mobile:

- chronological, thumb-friendly cards;
- no auto-playing social embeds.

### Scene 09 — find Gorilla

Job:

- complete the primary conversion.

Phase A, without live inventory:

- city/area selection;
- verified retailer categories and official map outbound links;
- clear “availability may vary” copy;
- no fabricated pins.

Phase B, only with approved data/API:

- searchable locations;
- bounded results and pagination;
- map loaded after intent;
- accessible list is primary, map is secondary;
- timeout, retry, fallback, and stale-data timestamp.

Motion:

- selected product signal travels into the locator CTA;
- result updates use restrained state feedback, not a map flythrough.

Mobile:

- bottom-sheet pattern only if fully keyboard/screen-reader safe;
- otherwise a simple list with “open in maps.”

### Scene 10 — FAQ and safety

Job:

- answer high-intent product, caffeine, sugar, availability, and contact questions;
- repeat approved warning in a readable context.

Design:

- grouped accordion with server-rendered answers;
- native disclosure semantics;
- no answer hidden from no-JS users.

Motion:

- height/opacity enhancement with deterministic cleanup;
- no stagger on every item.

### Scene 11 — contact and partnership

Job:

- route inquiries correctly.

Intent types:

- retail/distribution;
- media;
- event/partnership;
- product/support;
- privacy/legal.

If the form is not implemented securely, use verified mail/phone destinations instead of a fake form.

Form gate:

- labels, instructions, error summary;
- Zod validation on client and server boundary;
- bounded payload;
- timeout and abort;
- rate limit and abuse control;
- CSRF when cookie state exists;
- no PII in logs or analytics;
- privacy consent;
- deterministic success and retry states.

### Scene 12 — footer

Contains:

- locale-safe navigation;
- approved company/contact data;
- legal routes;
- warning;
- concept disclaimer;
- asset/brand copyright attribution as approved;
- motion preference;
- no placeholder social link.

Motion:

- five signals collapse into one closing line;
- reduced mode shows the final state immediately.

## 8. Motion direction

### Principles

1. Motion communicates selection, hierarchy, continuity, or material.
2. One dominant idea per scene.
3. Reading pauses movement.
4. Native scroll remains in control.
5. Desktop and mobile have separate choreography.
6. Every scene has full, lite, and reduced behavior.
7. Every scene has deterministic teardown.
8. Continuous loops require a product reason and Pause control.

### Timing language

Named tokens, never scattered magic numbers:

- `instant` — state confirmation;
- `quick` — hover/focus/press;
- `standard` — control and local reveal;
- `scene` — authored transition;
- `entrance-max` — hard cap for first entrance;
- `pin-mobile-max` — hard scroll-distance cap;
- easing roles: `enter`, `exit`, `material`, `snap`, `settle`.

Final numeric values are tuned in the vertical slice and stored once.

### Page transitions

- native View Transitions as progressive enhancement;
- preserve normal links and browser behavior;
- transition uses a five-signal wipe and product-color continuity;
- focus lands on the new page heading;
- back/forward restores sensible scroll;
- reduced mode uses an immediate route change or short opacity.

### Microinteractions

- buttons: 1–2 px directional pressure and label shift, not elastic wobble;
- product chips: hard lock and signal fill;
- links: underline scan that also appears on keyboard focus;
- cursor: optional fine-pointer enhancement only, never hides system cursor or controls;
- cards: content-first crop response, no generic floating shadow;
- menu: editorial split with stable focus.

### Loading

No fake percentage, mandatory intro, or logo animation that delays content.

Allowed:

- immediate final-quality poster;
- a meaningful sub-900 ms entrance after content is paintable;
- skeleton only for a real asynchronous module such as locator results;
- explicit retry/error for failed data.

### Reduced motion

Remove:

- parallax;
- scrubbed rotation;
- long pins;
- scale-through-space transitions;
- continuous marquee;
- autoplay decorative video where needed.

Preserve:

- content;
- product state;
- navigation;
- compare;
- warnings;
- locator;
- feedback through immediate state, color, border, and short opacity.

### Sound

Baseline is silent.

Sound is allowed only:

- after explicit user action;
- with original or licensed audio;
- with visible mute/stop;
- without being required to understand content;
- after performance and legal review.

### Optional P2 — Signal mode

After all release budgets are green, an opt-in “Signal mode” may turn original/licensed audio into a small waveform visualization:

- disabled by default;
- loaded only after user gesture;
- no layout movement;
- persistent mute/stop;
- session-only state;
- unavailable for reduced motion or data saver;
- removable without affecting product tasks.

This is preferable to a custom cursor, random glitch, or permanent ambient sound because it gives the signal concept a user-controlled role.

## 9. Asset production plan

### Required from the brand

- current Uzbekistan brand guide;
- vector logo and usage rules;
- exact palette;
- licensed webfont package or approved alternatives;
- all five current cans, every side, high-resolution;
- verified product matrix and nutrition labels;
- approved warnings and legal placements;
- official retailer/store data;
- approved Uzbek/Russian/English copy;
- permissions for packaging, images, video, people, and case study;
- current company and contact details.

### Original production

Preferred:

- own macro product photography;
- clean 3D can models built from approved dielines;
- original material/condensation plates;
- commissioned local editorial culture photography;
- original sound design only if justified;
- custom campaign lettering.

### Shot list

- five front pack shots;
- five 3/4 pack shots;
- five macro print/material shots;
- lineup hero;
- black-stage silhouette;
- flavor-specific material studies;
- mobile 9:16 hero/poster;
- desktop 16:9 hero/poster;
- culture portrait/environment set with releases;
- locator/support utility imagery only when necessary.

### Media derivatives

Images:

- widths 480, 768, 1024, 1440, 1920 where relevant;
- AVIF, WebP, safe fallback;
- art-directed crops;
- width/height or aspect ratio always declared.

Video:

- MP4/H.264 and WebM;
- desktop and mobile aspect variants;
- poster;
- muted decorative export;
- captions/transcript if speech;
- short GOP/seek profile only when interaction requires it;
- no hundred-frame scroll sequence by default.

Every asset gets owner, license, territory, expiration, consent, checksum, alt/decorative state, and source evidence.

## 10. Technical architecture

### Baseline stack

- Astro 7.1 static output;
- Vite 8;
- Node.js 24 LTS;
- exact pnpm version and lockfile;
- strict TypeScript;
- Astro components and native TypeScript controllers;
- GSAP + ScrollTrigger for complex choreography;
- CSS cascade layers/custom properties/container queries;
- Astro Content Collections + Zod;
- Astro Image/Sharp;
- FFmpeg/ffprobe;
- Vitest, Playwright, axe-core, Lighthouse CI, web-vitals.

### Dependency rule

Before adding a dependency, record:

- the capability it uniquely provides;
- why platform/CSS/current stack is insufficient;
- bundle cost;
- license;
- maintenance status;
- security status;
- cleanup/failure model;
- removal plan.

No React island, smooth-scroll library, slider package, form library, map SDK, or WebGL library enters by convenience.

### Content and state

- product content is validated at build time;
- locale parity is checked in CI;
- selected SKU is URL-derived;
- interaction state stays local;
- no global store;
- no remote content dependency for the first paint;
- no unvalidated `process.env` access.

### Security

- restrictive CSP, first report-only then enforced;
- `default-src 'self'`;
- no `unsafe-eval`;
- no external HTML injection;
- HSTS, `nosniff`, restrictive Permissions-Policy and Referrer-Policy;
- no secrets or private tokens in client bundle;
- analytics after consent and without PII;
- private sourcemap upload only;
- dependency audit, license audit, SBOM.

### Observability

Privacy-safe:

- LCP, INP, CLS;
- route and viewport tier;
- motion tier;
- save-data tier without fingerprinting;
- media load/error;
- scene initialization duration;
- client errors/unhandled rejection;
- locator and form success/error;
- WebGL fallback/context loss only if introduced.

Do not collect full query strings, DOM text, email, name, or precise coordinates.

## 11. Performance budget

Budgets are release blockers.

| Budget | Mobile | Desktop |
|---|---:|---:|
| Initial JS, gzip | ≤ 90 KB | ≤ 120 KB |
| Route JS total, gzip | ≤ 140 KB | ≤ 180 KB |
| CSS, gzip | ≤ 35 KB | ≤ 45 KB |
| First-view fonts | ≤ 140 KB | ≤ 180 KB |
| LCP poster | ≤ 180 KB | ≤ 320 KB |
| Transfer before LCP | ≤ 650 KB | ≤ 900 KB |
| Initial viewport transfer | ≤ 900 KB | ≤ 1.25 MB |
| Lazy page media total | ≤ 4 MB | ≤ 8 MB |
| One decorative loop | ≤ 1.5 MB | ≤ 2.5 MB |

Targets:

- field p75 LCP ≤ 2.5 s;
- field p75 INP ≤ 200 ms;
- field p75 CLS ≤ 0.1, internal target ≤ 0.05;
- Lighthouse production median of three: all categories ≥95;
- mobile TBT ≤150 ms;
- no animation long task >50 ms;
- no persistent scroll below 50 fps on target mid-tier Android;
- memory returns to a stable plateau after 20 scene/navigation cycles;
- no below-fold video before intent or proximity.

## 12. Accessibility acceptance

WCAG 2.2 AA is a release gate:

- one meaningful `h1`;
- landmarks and skip link;
- keyboard-complete navigation, selection, compare, dialogs, and form;
- focus trap, Escape, restoration, and non-obscured focus;
- viewport zoom enabled;
- visible labels and accessible names;
- meaningful alt, decorative empty alt;
- captions/transcript where required;
- no information by color alone;
- Pause/Stop for applicable motion;
- reduced-motion and user motion control;
- forced-colors and prefers-contrast smoke test;
- 200% zoom and text-spacing;
- content/navigation usable without JS;
- semantic table for nutrition and comparison;
- map never replaces the accessible store list.

## 13. Testing and QA

### Unit/build-time

- schemas and locale completeness;
- claim-to-source linkage;
- media provenance;
- environment validation;
- motion capability policy;
- feature state machines;
- URL selection state;
- locator result bounding;
- token constraints.

### Integration

- semantic feature output;
- navigation/menu focus lifecycle;
- product selector and compare;
- FAQ disclosures;
- media fallback;
- full/lite/reduced rendering;
- scene setup/teardown;
- form adapter only if introduced.

Tests assert semantic end states and cleanup, not exact GSAP matrix values.

### E2E

Playwright:

- deep links and locale preservation;
- keyboard-only journey;
- mobile menu;
- product selection and comparison;
- Pause/Resume;
- no-JS content;
- reduced motion;
- data saver;
- media failure;
- locator failure and empty results;
- 404;
- browser back/forward and scroll restoration;
- no console/page errors;
- 20 resize/navigation cycles without growing owned resources.

### Visual matrix

- 320×568;
- 360×800;
- 390×844;
- 412×915;
- 430×932;
- 768×1024;
- 1024×768;
- 1366×768;
- 1440×900;
- 1920×1080.

Use a deterministic QA-only `?motion=static` mode for screenshots. It must not become a hidden production dependency.

### Manual matrix

- NVDA with Chrome/Firefox;
- VoiceOver with Safari/macOS/iPhone;
- TalkBack with Android Chrome;
- keyboard at 200% zoom;
- real mid-tier Android;
- real iPhone Safari;
- Windows Chrome/Edge;
- macOS Safari;
- 30-minute thermal/memory soak.

### Legal screenshot audit

Review every independently shareable context:

- hero;
- product card;
- product route;
- OG/social preview;
- culture card;
- locator result;
- mobile viewport;
- video poster;
- screenshot/case study.

Verify disclaimer, warning, claims, people, and no implied endorsement.

## 14. CI/CD

### Pull request

1. Frozen install.
2. Format check.
3. ESLint and strict typecheck.
4. Unit and content-schema tests.
5. Static build.
6. Links, provenance, media, and locale verification.
7. Bundle/media budgets.
8. Dependency security and license audit; SBOM.
9. Playwright Chromium, WebKit, and Firefox smoke.
10. axe accessibility.
11. Visual regression.
12. Lighthouse CI median.
13. Immutable preview deployment.

### Release

1. Rebuild from lockfile.
2. Verify artifact checksum.
3. Deploy immutable staging artifact.
4. Verify headers, CSP, cache, redirects, 404, media, and locale.
5. Manual legal/brand approval.
6. Promote the same artifact.
7. Record commit, artifact, provenance, and baseline metrics.
8. Watch RUM and errors for 72 hours.

Rollback promotes the previous immutable artifact without rebuilding.

Hosting is chosen after measuring Tashkent latency and media delivery; the application remains platform-agnostic static `dist`.

## 15. Delivery phases and gates

### M0 — authorization and truth

Deliver:

- permission and publishing boundary;
- asset rights matrix;
- local legal review brief;
- current five-SKU truth table;
- approved warnings;
- target audience and conversion model.

Gate:

- no unknown product claim enters design;
- owner-confirmed permission is recorded and item-level evidence remains traceable.

### M1 — experience architecture

Deliver:

- route map;
- page/section purpose;
- content source per section;
- CTA map;
- desktop storyboard;
- independent mobile storyboard;
- motion map with full/lite/reduced/fallback;
- SEO and structured-data plan;
- asset shot/render list.

Gate:

- every section has a task and exit;
- no motion exists only “because it looks cool.”

### M2 — two creative territories

Create only two coherent alternatives:

A. `Signal/Industrial Editorial` — recommended.
B. `Night Print/Living Poster` — more cultural, less product-lab.

Test:

- hero;
- flavor selector;
- product truth;
- locator CTA;
- mobile key screen;
- reduced-motion frame.

Gate:

- select one system;
- do not hybridize leftovers from both.

### M3 — design system

Deliver:

- approved color roles;
- type specimen and license;
- grid, spacing, radius, border, and material tokens;
- button, link, chip, menu, disclosure, table, form states;
- flavor themes;
- motion tokens;
- contrast/reduced/high-contrast frames.

Gate:

- all glyphs, warnings, mobile lines, and UI states pass;
- no temporary font remains.

### M4 — performance/motion vertical slice

Build only:

- semantic header/menu;
- hero;
- one flavor transition;
- one product truth panel;
- one video/poster scene;
- footer;
- full/lite/reduced motion;
- media pipeline;
- baseline tests.

Gate:

- performance budgets pass;
- no-JS path works;
- mobile target device is smooth;
- lifecycle soak is stable;
- all controls accessible;
- WebGL receives a separate go/no-go decision.

Failure means simplifying choreography, not expanding schedule.

### M5 — production foundation

Deliver:

- Astro scaffold;
- content and provenance schemas;
- CSS layers/tokens;
- motion runtime;
- test harness;
- CI;
- CSP/headers;
- localization routing;
- error pages.

Gate:

- deployable semantic skeleton;
- no unused scaffold or placeholder route.

### M6 — static semantic implementation

Build all routes and sections without advanced animation:

- navigation;
- product range/details;
- compare;
- locator path;
- culture;
- FAQ;
- contact;
- legal and disclaimer;
- metadata, sitemap, hreflang, 404.

Gate:

- usable without JS;
- keyboard/screen-reader journey complete;
- no placeholder text, `href="#"`, fake form, or dead button.

### M7 — media integration

Deliver:

- approved original/brand assets;
- optimized responsive derivatives;
- posters and video variants;
- captions/transcripts;
- cache rules;
- provenance.

Gate:

- every asset passes rights and weight;
- failed media never hides content.

### M8 — choreography

Add:

- hero entrance;
- flavor signatures;
- product-lab material reveal;
- compare alignment;
- film;
- culture editorial transitions;
- locator continuity;
- route transitions;
- microinteractions;
- pause/reduced controls.

Gate:

- matches approved motion map;
- independent mobile choreography;
- no global selectors or global cleanup;
- memory/thermal soak stable.

### M9 — hardening

- full automated matrix;
- manual accessibility;
- localization review;
- Lighthouse and long-task profiling;
- CSP enforcement;
- dependency/license/security audit;
- legal screenshot audit;
- brand review;
- repository clean-room audit.

Gate:

- three consecutive green performance runs;
- zero P0/P1 defects;
- every accepted risk documented;
- rollback tested.

### M10 — release candidate and presentation

Deliver:

- production-ready preview URL;
- executive summary;
- mobile-first prototype walkthrough;
- product taxonomy;
- before/opportunity framing without disparagement;
- localization and compliance story;
- performance/accessibility evidence;
- implementation roadmap;
- brand asset request;
- implementation and content handoff package.

### M11 — public release

After item-level provenance, claim, quality, and release gates:

- replace temporary/disallowed assets;
- final claim/warning verification;
- production analytics and domain;
- production smoke;
- 72-hour monitoring;
- public case study with approved wording.

## 16. Multi-agent execution model

The implementation goal should use bounded specialist agents with explicit ownership:

### Product/legal/content agent

Owns:

- SKU truth registry;
- claims and source mapping;
- locales and glossary;
- legal warning placement;
- content QA.

Cannot approve law or invent facts. Escalates to brand/counsel.

### UX/product-design agent

Owns:

- IA, tasks, selection, compare, locator, contact;
- mobile storyboard;
- accessibility interaction contracts;
- usability validation.

### Art/type agent

Owns:

- creative territory;
- grid, type, color, material, flavor themes;
- keyframes and asset direction;
- originality matrix.

### Motion director

Owns:

- motion map;
- full/lite/reduced states;
- scene choreography;
- pause policy;
- performance-safe timing.

### Frontend architect

Owns:

- Astro structure;
- content schemas;
- import boundaries;
- motion lifecycle;
- media pipeline;
- security and CI.

### QA/performance agent

Owns:

- test matrix;
- visual/a11y/performance evidence;
- budgets;
- memory and cleanup;
- release gates.

Rules:

- one owner per file/decision;
- agents review one another’s outputs but do not overwrite concurrently;
- shared contracts are settled before feature implementation;
- a failed gate returns work to the owning phase;
- no agent may declare legal approval, asset permission, or performance success without evidence.

## 17. Seven recorded self-critique passes

### Pass 1 — derivative risk

Critique:

Changing product, copy, and palette would still leave a recognizable clone if section order and choreography stayed familiar.

Correction:

The plan now uses a product-selection funnel, five-state signal system, product lab, compare, locator, separate route model, and original motion signatures. Reference code, media, metrics, and timings remain outside production.

### Pass 2 — legal and audience risk

Critique:

The obvious Gorilla route—fighters, riders, consumption, victory—can conflict with Uzbekistan advertising restrictions and target the wrong audience.

Correction:

The concept is adult, product/flavor-led, excludes consumption and athletes before counsel approval, places warnings beyond the footer, and adds a legal screenshot gate.

### Pass 3 — product-truth risk

Critique:

Global Gorilla information and local API values may not match current Uzbekistan packaging; even official API data can contain unit or localization errors.

Correction:

Every claim requires local SKU, source evidence, verification date, brand/legal status, and build-time linkage. Unverified facts render as unavailable rather than guessed.

### Pass 4 — awards versus usability

Critique:

A long cinematic scroll can win attention while preventing product choice and purchase intent.

Correction:

Every scene has a job and CTA. Selector, product truth, compare, and locator form the backbone; film and culture remain supporting moments.

### Pass 5 — mobile and accessibility

Critique:

Shrinking desktop pins, hover effects, and horizontal storytelling would create an inferior mobile site and motion barriers.

Correction:

Mobile has a separate storyboard, native vertical flow, bounded pins, no page overflow, direct controls, 44 px targets, zoom support, Pause, and full content in reduced/no-JS modes.

### Pass 6 — runtime and media risk

Critique:

React hydration, WebGL, preloaded video, smooth scroll, and unowned GSAP timelines could turn polish into jank and leaks.

Correction:

Astro static-first is the baseline; native scroll remains; poster-first media and hard budgets apply; WebGL requires an isolated kill gate; every scene owns deterministic cleanup.

### Pass 7 — legitimacy and release risk

Critique:

Publicly presenting a polished Gorilla experience could imply endorsement and redistribute protected brand assets.

Correction:

The plan establishes a private `noindex` pitch, visible disclaimer, provenance ledger, permission matrix, and a fictional-brand fallback. Public release cannot occur implicitly.

## 18. Definition of done

The work is complete only when:

- no copied code, asset, text, distinctive composition, or timing exists;
- rights exist for every production asset;
- local claims and warnings are approved;
- all routes have Uzbek and Russian parity; English is either complete or absent;
- meaningful content works without JS;
- full/lite/reduced motion are complete;
- mobile is independently approved;
- keyboard, screen reader, touch, and mouse journeys work;
- zoom is enabled;
- no autoplay audio;
- performance budgets pass median-of-three CI and real-device review;
- no persistent memory, listener, observer, animation, or video leak exists;
- security, license, dependency, and provenance audits are green;
- no placeholder link, fake form, dead button, silent catch, unsafe assertion, or untracked TODO exists;
- CSP, caching, redirects, 404, and rollback are verified;
- legal screenshot audit passes;
- README, ADRs, architecture, motion map, provenance, and release record match reality;
- public visibility matches the permission state.

## 19. Executable goal prompt for GPT-5.6

Use the following as the implementation goal after M0 inputs are available:

```text
You are the lead delivery agent for an independent Gorilla Energy Uzbekistan
product-experience concept. Operate as a senior product designer, UX/UI
designer, motion director, frontend architect, accessibility engineer,
performance engineer, security reviewer, and release owner.

Repository:
C:\Users\sam4k\Documents\Портфолио-типографика\tashkent-motion-product

Read completely before acting:
1. AGENTS.md
2. RULES.md
3. docs/product/GORILLA_MASTER_PLAN.md
4. docs/product/GORILLA_CONCEPT.md
5. docs/architecture/TARGET_ARCHITECTURE.md
6. docs/quality/ENGINEERING_STANDARD.md
7. all accepted ADRs in docs/decisions/

Objective:
Implement and release the approved Gorilla Uzbekistan concept from M0 through
M11. The project owner has confirmed brand and publishing permission. Preserve
the clean-room boundary and do not imply a commissioning/operating relationship
without separate evidence.

Hard constraints:
- Build independently; do not copy reference code, media, copy, section metrics,
  timings, or distinctive composition.
- Treat every Gorilla asset and claim as publishable only when the source
  registry proves item-level provenance.
- Do not show consumption, target minors, use athletes, or imply product-caused
  sporting/social/physical/mental success without written local legal approval.
- Use Uzbek Latin as source locale and full Russian parity. Add English only when
  complete.
- Use Astro 7.1 static output, Vite 8, Node 24 LTS, pinned pnpm, strict TypeScript,
  native Astro/TypeScript by default, CSS layers, GSAP/ScrollTrigger only where
  justified, Content Collections/Zod, and the documented media/test stack.
- Do not add React, WebGL, smooth scroll, a CMS, map SDK, slider, or form library
  without a measured ADR.
- Core content and navigation must work without JS.
- Build full/lite/reduced motion and independent mobile choreography.
- Meet every performance, accessibility, security, provenance, and release budget.

Execution:
1. Inspect repository status and existing user changes.
2. Convert unknown M0 requirements into a blocking input register. Continue with
   safe work that does not invent those inputs.
3. Use bounded senior specialist agents for product/legal/content, UX, art/type,
   motion, architecture, and QA. Give one owner per decision/file.
4. Complete phases M0–M11 in order. Never start a later phase while its gate is red.
5. At M2, create exactly two coherent creative territories, evaluate them against
   product task, originality, mobile, accessibility, legal, asset feasibility, and
   performance, then select one. Do not mix discarded visual fragments.
6. At M4, build the vertical slice and treat performance/accessibility/lifecycle
   failure as a choreography simplification trigger.
7. Implement semantic content before advanced motion.
8. Record asset/claim provenance and fail the build for missing approval.
9. Verify with automated and real-device evidence. Never claim a pass without it.
10. Keep documentation synchronized with each material decision.

For every material decision and implementation step, perform at least five
explicit critique→improvement passes:
1. correctness and edge cases;
2. architecture, lifecycle ownership, and cleanup;
3. UX, mobile, accessibility, and reduced motion;
4. performance, media, security, and dependency risk;
5. maintainability, provenance, legal boundary, and release readiness.

Add additional passes whenever a material weakness remains. Record concrete
issues, corrections, and evidence; do not claim that a result is literally
uncriticizable.

Stop conditions:
- Stop before inventing product facts, legal copy, retailer data, or asset
  provenance.
- If a phase gate fails, fix or reduce scope; do not waive it silently.

Final handoff:
- working production deployment;
- source and reproducible build;
- green CI and test evidence;
- device/accessibility/performance reports;
- rights/claims/provenance ledger;
- current ADRs and architecture;
- motion map and reduced-motion equivalence;
- release and rollback runbook;
- release/case-study package;
- explicit item-level provenance and review register.
```

## 20. Immediate next action

Do not scaffold the full site yet.

Start M0 and M1 by obtaining:

1. five-can current packaging evidence;
2. approved product truth table;
3. warning text and legal interpretation;
4. recorded brand/IP permission basis;
5. brand kit and font rights;
6. verified retailer/store route;
7. Uzbek/Russian editorial ownership;
8. target devices and Tashkent connection profile.

In parallel, create the two M2 keyframe territories using non-public, provenance-marked temporary material. Then build one vertical slice and prove the experience before scaling it.

## 21. Research sources and baseline

Primary sources used for this plan:

- Gorilla Energy Uzbekistan: <https://www.gorillaenergy.uz/>
- Gorilla global brand story: <https://gorillaenergy.com/pages/our-story>
- Uzbekistan Competition Committee energy-drink advertising explanation:
  <https://raqobat.gov.uz/uz/istemolchidan-savol-3/>
- Uzbekistan government advertising guidance:
  <https://gov.uz/oz/advice/74/document/1286>
- Competition Committee notice concerning Gorilla/AION advertising:
  <https://raqobat.gov.uz/gorilla-energetik-ichimligi-reklamasini-keng-targib-qilgan-aion-beverages-mchjga-nisbatan-reklama-qonunchiligi-buzilishi-yuzasidan-tegishli-tasir-choralari-korildi/>
- Astro 7.1 release: <https://astro.build/blog/astro-710/>
- Vite 8.1 release: <https://vite.dev/blog/announcing-vite8-1>
- Node.js release status: <https://nodejs.org/en/about/previous-releases>
- GSAP matchMedia lifecycle documentation:
  <https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/>
- WCAG 2.2 Pause, Stop, Hide:
  <https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html>
- Core Web Vitals: <https://web.dev/articles/vitals>

Local Lighthouse snapshot on 2026-07-26, for opportunity framing only:

| Current official site | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| simulated mobile | 27 | 82 | 73 | 91 |
| desktop | 43 | 75 | 77 | 82 |

Observed mobile lab metrics included LCP around 8.1 s and TBT around 8.7 s. The result is environment-dependent and must not be presented as a permanent brand fact. It establishes why the new concept uses static HTML, poster-first media, enabled zoom, named controls, alt text, metadata, and hard performance budgets.
