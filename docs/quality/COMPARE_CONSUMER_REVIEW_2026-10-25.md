# Compare and FAQ consumer cleanup — 2026-10-25

## User outcome

Make comparison read as product selection rather than an engineering console.
Keep the approved five-signals campaign, product artwork, selection/share logic,
native fallback, real status announcements and responsible information.

Copywriting diagnosis: point edit. Adult visitors need to identify products,
compare flavor descriptions and open real product pages. No new product values,
health claims or availability promises are introduced.

## Changes and five review lenses

1. Correctness: remove decorative `CH/…`, signal-lock text, `NO SIGNAL / 000`
   and the unmeasured `00/05` meter. Preserve canonical product names, descriptions,
   links and selection state. FAQ caffeine guidance no longer promises a numeric
   value on a product page that does not contain one; both product-information
   answers point directly to the purchased can label.
2. Architecture: delete unused markup, localization keys and associated CSS,
   including responsive meter/frequency rules. Selection/domain logic, lifecycle
   ownership and public APIs are unchanged. Slot numbering appears once in the
   localized native label rather than twice.
3. UX/accessibility: keep native selects, feedback/live regions, real errors and
   product actions. Product names now remain visible at phone widths and wrap
   rather than truncate. UZ/RU/EN use human product/flavor/description labels.
   No preference, warning or independent-concept disclosure is removed.
4. Performance/security: fewer decorative nodes/rules; no new dependency, media,
   network call or event handler. Existing WebKit/performance failures are not
   excused by this copy refinement or by a static screenshot.
5. Maintainability/release: contracts assert absent technical chrome together
   with real painted names, notes and descriptions. Native fallback checks five
   products, three meaningful rows, fifteen nonempty cells and five real links.

## Verification and limitations

### Confirmed mobile layout defect and correction

The initial static comparison exposed overlapping/clipped upper cans when three
products are selected. The desktop three-column selector had higher specificity
than the mobile two-column selector, which covered only counts one and two.
The mobile rule now includes count three. A named viewport-relative can-height
cap also reserves room for the native tilt/scale at 320px, without changing the
390px or desktop maximum. Artwork, pose and selection remain intact.

Twelve new browser cases pass at 320/360/390/768 across all three engines. They
require two actual grid columns, three loaded native images, full horizontal
can bounds inside the arena and separation of the upper two image bounds.
Before the fit cap, all three engines correctly rejected the narrow 320px edge
overrun; those failed artifacts are preserved privately. The previous broad
arena tests required only intersection, which could not detect this defect.

Final `quality:pages` passes: formatting, lint, strict diagnostics on 252 files, 177
unit tests, 47-page build, artifact/font/content/provenance/SBOM checks and audit
with no known vulnerabilities. A later test-only correction adds Node's required
JSON import attributes; the initial browser collection error was not a product
failure.

The first browser batch ended with **50 passed, 10 existing Chromium-only skips
and 9 failed**. Six failures were incorrect test expectations: old fallback
placeholder rows (five versus the actual three), and an assumption of two
visible product slots despite the current three-slot mobile contract. They
were corrected to assert current useful content, not to restore placeholder UI.
Three WebKit Full-context failures remain at 1024/1440/1920; their boolean-poll
failure does not yet distinguish native image readiness from motion cleanup.
Their original traces were overwritten by the next Playwright run, so no exact
stack attribution is claimed. Future failed artifacts must be archived before
the output directory is reused.

The focused follow-up passes all nine native no-script FAQ cases and three
native fallback cases. The three all-locale browser tests then pass with the
correct three-slot count, covering UZ/RU/EN in each engine. This is not a fresh
full-suite pass and does not close the three unexplained WebKit failures.

The initial six long element captures were not accepted as clean viewport
evidence: fixed header/skip-link pixels appeared inside the tall capture, and
the real mobile column defect was visible despite zero text-metric findings.
After the responsive fix, six actual viewport captures at UZ/RU 320/390/1440
confirm separate complete upper cans, readable labels and the fixed header in
its normal position. The blue skip-link artifact is absent in these native
viewport images; no focus/style hiding was used. This bounded visual review is
not Full-motion, all-locale/all-route, keyboard or physical-device acceptance.

The intermediate failed localization artifacts are preserved privately under
`.tmp/compare-copy-verification-before-count-fix/`. No trace, local account path
or private screenshot is added to the public repository.

## Landscape and product-name follow-up

The short-landscape rule incorrectly applied seven mobile rows through 1023px,
although the three-column cards above 768px use only the first three rows.
Initial native viewport images and measurements show a 288px unused track at
769/844px (290px including the border). The new regression rejected both cases
before the CSS fix; one- and two-product cases passed unchanged. The seven-row
layout now applies only to the two-column composition at or below 768px.

Intermediate three-column headings also used viewport-sized lettering that
split Uzbek `Shakarsiz` into a word and a final letter. Their existing viewport
type ramp is now capped by a named local-column fit token. The copy block owns
the inline-size container; phone heading rules and the larger desktop ramp
remain authoritative at their own breakpoints.

Five review lenses:

1. Correctness: test one/two/three selections at five landscape widths, including
   the exact 768/769 boundary. Require real copy, headings, actions and the
   arena's end to coincide with content, rather than just checking no overflow.
2. Architecture: CSS-only presentation changes with no new runtime owner or
   dependency. Browser text measurement and assertions are separate small
   helpers; existing loaded-face verification is reused.
3. UX/accessibility: preserve product count, artwork, native scrolling, actions
   and legal content. Lexical words must paint intact and inside the heading;
   natural compound-name breaks at dashes are permitted. UZ/RU/EN and 100/200%
   root-font stress are covered, which is not a physical-device or browser-zoom
   certification. Fluid heading sizes do not imply an exact doubling of every
   computed font size when the root size doubles.
4. Performance/security: no new media, network work, handlers or animation.
   Existing Full-motion/WebKit/Lighthouse failures remain open; static layout
   passes do not prove motion performance.
5. Maintainability/release: retain initial failures privately and compare one
   final four-viewport batch. Document the mismatch between layout breakpoints
   instead of adding unexplained empty-space overrides.

Final source quality passes: strict diagnostics on 254 files, 177 unit tests,
47-page build, formatting/lint, artifact/provenance/SBOM checks and dependency
audit. The strengthened browser batch passes **93/93** cases: 45 landscape,
36 localized product-name/root-font and 12 portrait artwork cases across three
engines. Four final UZ viewport images at 768/769/844/1024 all have only the 2px
border after content; `Shakarsiz` is whole. No full-suite or release approval is
inferred. Initial/final images remain private in `.tmp/compare-landscape-*`.
