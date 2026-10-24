# Consumer mobile refinement — 2026-10-25

## Publication hold

The latest user feedback rejects the mobile presentation and exposed developer
information. It supersedes the earlier request for immediate promotion. PR #7
was returned to draft. Do not merge or deploy this checkpoint as a finished
product without the remaining visual and motion verification.

## Implemented changes

- Header shows the brand and navigation. The real pause/resume control remains
  keyboard-accessible inside the menu; runtime tier badges are not customer UI.
- Entry animation settings use a native, initially collapsed disclosure. Device
  reduced-motion preferences remain respected without opening settings.
- Compare omits entirely unavailable sugar/composition rows and the repeated
  packaging-data placeholder. Approved names, descriptions, flavor notes, real
  links, selection state and no-script table remain. No specifications invented.
- Atlas uses product/flavor language and removes decorative GPS/live-scan
  readouts. Hash navigation and accessible selection announcements remain.
- Contact uses two columns at medium widths and three only at wide widths.
  Text tracks shrink correctly; section and topic typography fit actual words.
- FAQ headings and calls to action own complete rows instead of losing width to
  their metadata. Tablet footer gives navigation sufficient width.
- Product-information links have real 44px targets. Extra's small heading label
  uses the paper foreground. Mango's description has an opaque warm surface so
  its dark text remains readable over the blue diagonal.
- Compact hero entry travel is 32px rather than desktop 112px, shared by CSS
  framing and the actual animation. The mobile artstage no longer reserves the
  desktop entrance's excessive vertical clearance.
- Lite receives a finite 640ms can/title/band sequence. Reduced and no-script
  defaults preserve static content; mobile is not forced into Full.
- Product-world scroll transforms start after the real entrance timeline
  releases ownership, through the scene's owned callback and abort guard.

## Five review lenses

1. Correctness: retain canonical product facts, selected products and real
   navigation; remove unavailable data rather than fabricating it.
2. Architecture: share compact entry constants between framing and motion;
   retain scoped resources and deterministic cleanup, with no global kills.
3. UX/accessibility: preserve native disclosures, pause, keyboard/focus behavior,
   reduced motion, localized labels and practical touch targets.
4. Performance/security: preserve current audited dependency pins and artifact
   budgets. Logical transform ownership is not a measured FPS guarantee.
5. Maintainability/release: adapt tests to the actual consumer journey; preserve
   negative controls and record failures rather than regenerating every golden.

## Evidence and limits

The earlier all-page capture covered 47 HTML documents at 320, 768 and 1440px,
plus three Contact contexts at 1024px. It exposed genuine Contact clipping,
small legal links, FAQ orphan letters and Mango/Extra readability problems.
Full-page images re-skip deferred sections after returning to the top, so black
regions in those files do not prove that lower home scenes were visually tested.
Real scroll-position captures are required for those scenes and footers.

The first coherent consumer source quality run passed 247 strict-check files
with zero diagnostics, 177 unit tests, 47 routes, artifact/font/provenance/SBOM
checks and the dependency audit. A subsequent focused browser run exposed a
long Russian Contact topic overflowing and a 44px menu control measuring
43.99997px during its presentation. The topic scale and control geometry were
corrected in source; they were not waived by a larger tolerance.

Final browser/visual evidence must be recorded against the resulting artifact.
High-density WebKit active-frame performance, all animation paths, physical
devices, assistive technology and final commercial approval remain unproven.

The corrected final browser batch passed all 54 Chromium contracts in 45.6s:
16 Contact layout cases, 10 entry/transition cases, 10 FAQ cases, four consumer
chrome/no-script cases and 14 localized typography cases. These include real
old-layout negative controls, keyboard navigation and 200% text spacing. The
two known failures from the preceding batch are not hidden or retried away;
their source geometry was corrected before this new build and complete rerun.
This result is not cross-engine or frame-performance acceptance.

## Follow-up consumer language and lifecycle checks

Locator, Contact, Culture and FAQ now use direct product/action language instead
of source-verification, outbound-routing and design-study labels. The locator's
single notice about unverified retailer availability is retained. Official
destinations, product data, privacy boundaries and the independent-concept
disclaimer are unchanged. The contact action is concise instead of repeating a
two-sentence data-collection notice in a large button.

Unused header tier-badge pseudo-elements and signal styles were removed rather
than hidden behind another override. The menu control's scoped selector retains
its 48px target against the generic menu-button rule; no-script hiding uses the
same selector specificity. A broader lifecycle batch caught that specificity
regression before acceptance. The source was corrected, rebuilt and the entire
batch rerun: all 41 Chromium cases passed in 45.5s, including Contact, FAQ, real
pause/persistence, Full-to-Reduced cleanup, route/menu state and five distinct
product-world scrub responses. This does not replace the WebKit FPS gate.

The coherent source check passed 247 strict-check files with zero diagnostics,
177 unit tests, 47 routes and all artifact/security gates. After the final
CSS-only specificity correction the build passed again. A separate actual
320px locator word probe covered UZ/RU/EN with loaded fonts and atomic word/owner
rectangles: every word stayed on one line within the 304px panel right edge.
The longest Uzbek word ended at 303.671875px; no speculative type shrinking was
applied. These observations are not a new all-page/cross-engine visual approval.

The remaining film-section label “Material study” was replaced in all three
locales with direct Gorilla-film language, and the decorative “MATERIAL /
SIGNAL” readout now identifies “GORILLA / UZ”. This is a point edit, not a new
claim about the film, product or commissioning status. Five review lenses:
localized values remain complete; existing content/API ownership is unchanged;
no controls, warnings or semantic structure are removed; no assets/dependencies
or animation cost are added; and the outstanding frame-performance gate above
remains explicit rather than being implied complete by this copy correction.

A fresh at-scroll Chromium visual check covered the film and contact sections
at UZ 320px, RU 390px and UZ 768px with loaded fonts and Reduced motion. All six
viewports had zero document overflow and zero page errors. Direct screenshot
inspection found the film heading's local 0.78 leading too compressed; it now
uses the existing 0.9 display-leading token. The three film screenshots were
recaptured and inspected after rebuilding. This preserves type size, content,
scene ownership and the established scale while separating adjacent lines.
No performance, physical-device or all-screen acceptance is inferred from
these six observations. The build, content-integrity check and point-edit
formatting check passed; the preceding complete browser suite is historical.
