# Compact homepage content parity — issue #17

## Outcome and source evidence

Restore the unchanged homepage description at compact widths without growing an
absolute CTA overlay across the packshot/headline. The source max-width:22rem
rule hid `.hero-copydeck > p`; the committed 320px golden visibly lacks that
description. At 320px the 16px gutters and 12px compact padding leave 264px for
copy. Absolute bottom placement provides no intrinsic space for extra lines,
so deleting only `display:none` is not a complete responsive repair.

## Scoped composition and ownership

One neutral `.hero-artstage` wrapper owns the existing frequency field, kicker,
headline/plate and product/orbit. Outside the compact breakpoint it uses
`display:contents`; an audit found no direct-child selector dependency for these
elements. Motion queries remain scene-scoped descendant selectors with unchanged
data hooks. The existing desktop/tablet/390px grid and containing block therefore
have no intentional change, but actual visual parity still requires measurement.

At <=22rem the artstage is a real intrinsic box: kicker, heading and plate take
normal flow, while the authored decorative product overlay stays local to that
box. Its minimum derives from the existing can-height and spacing tokens, rather
than an arbitrary taller hero. Lime circle/wedge/frequency/orbit belong to this
artstage, so description growth does not stretch their composition. The stage
clips only outlying decoration; real headline, plate and packshot must be proven
fully bounded by its growing box before accepting the change.

The unchanged black copydeck follows in normal flow with its description and
lime/text CTAs. Long text may wrap and enlarge the page; it is not hidden,
line-clamped, resized to evade zoom, or allowed to overwrite the packshot. Narrow
word wrapping preserves legibility under enlarged text without changing copy or
font metrics. Original source photography, palette and choreography are untouched.

## Five review lenses

1. Correctness: retained all localized copy; removed the hide rule. The compact
   minimum follows can geometry, including the existing 28rem landscape case.
   The local aspect CSS property derives from validated ProductView dimensions,
   not copied metadata. A source contract binds the current seven-degree entry,
   0.76 starting scale, 112px translation, two-degree rest rotation and
   back.out(1.15) easing to compact clearance. The analytic Back peak gives a
   maximum scale below 1.012; that conservative named envelope participates in
   width and intrinsic-height bounds. Any change to those source inputs fails
   the contract and requires revisiting the envelope. Actual Full-mode paint
   remains unverified until a fresh browser probe; no clipping is accepted as
   evidence of fitting.
   Actual geometry is pending a fresh build, not inferred from these declarations.
2. Architecture: one neutral wrapper and one focused compact stylesheet; no
   duplicated hero/component or motion lifecycle. Direct-child dependencies were
   inspected before changing hierarchy; selector/data identities remain stable.
3. UX/accessibility: normal-flow copy and controls can grow under 200% font size
   plus WCAG text spacing. Tests require positive paint and complete text-line
   bounds, localized navigation, real keyboard focus and practical touch targets.
4. Performance/security: CSS layout only, no dependency, runtime observers or
   new image/video payload. The known independent font CLS, route-race and
   high-DPI entrance findings are not claimed fixed by this layout work.
5. Maintainability/release: a dedicated parity helper rejects hidden-content
   false positives. Its countercontrol first verifies real unmutated geometry,
   then injects the old hidden description and requires failure. No blanket
   snapshot update is authorized; the 320px intentional change and all unchanged
   larger compositions require separately reviewed screenshots.

## Verification pending

No build/browser was run during the exclusive maintenance routing-patch window.
The new engine-neutral test matrix covers UZ/RU/EN, 320x800 and compact landscape,
Reduced/no-JS, enlarged typography/text spacing, bounded product/headline/plate,
description/CTA ordering and real product navigation. Fresh build hash, all-engine
results, baseline/stressed screenshots, 320 golden disposition and unchanged
360/390/tablet/desktop proof must be recorded before reporting issue #17 resolved.

No-JS currently uses its existing hidden dialog plus visible responsible fallback,
not a native Continue closure: the button is type=button without a dialog form.
The regression suite explicitly checks those real fallback semantics. The
remaining open attribute/body scroll-lock relationship was confirmed by source:
the old body selector locked a hidden no-JS dialog. The narrowly approved related
fix now applies that lock only to an actual native `:modal` dialog, preserving
JavaScript modal isolation and the existing no-JS warning. Each no-JS compact
case must prove actual mouse-wheel scrolling changes scrollY before resetting
position for measurements. A programmatic scroll alone is not accepted as proof.
The fallback is not reported functional until these native input checks pass;
no age-entry removal or native Continue form is introduced.

## Measured implementation iterations

- Initial full quality stopped on an exact-optional baseURL fixture type; explicit
  undefined handling and URL parsing corrected that boundary before any build.
- Initial browser checks found a genuinely out-of-stage rotated plate at 200%
  text size. Compact-only straight text-plane reflow now retains the black/lime
  identity without assuming a finite future localized paragraph height.
- No-JS `addStyleTag` stalled on its load-event promise. Synchronous fixture style
  insertion replaces that harness behavior; actual computed 32px root font,
  48px paragraph line-height and 3.84px letter spacing prove stress was applied.
  Runtime/CSP errors remain asserted, not ignored.
- Glyph ranges are bounded by their actual clipping owner (stage or copydeck),
  not an intentionally tight display line-height box. Unmutated geometry must
  pass before the old hidden-description countercontrol is applied.
- Real enlarged-header overflow required compact natural wrapping. Real Russian
  legal-marker overflow required a separate compact flex-wrap/min-inline-size
  repair; no warning/link text is changed or removed. These were application
  findings, not excuses to relax the one-pixel global overflow gate.
- Three header rows are actually measured for Russian enlarged text (297px),
  versus 193px for UZ/EN and 64px normally. Conservative target clearance derives
  from three control rows and two existing gap tokens; focused heading scroll is
  checked against actual sticky-header bounds. In short compact landscape the
  header is normal flow, and its viewport-height menu remains internally
  scrollable rather than occupying the document with an unbounded overlay.

## Latest evidence and remaining gates

Full quality session 97094 passes on the final source: 226 strict-check files,
zero diagnostics, 117 unit tests in nineteen files, 47 pages and the unchanged
artifact/provenance/font/budget/617-component SBOM/FFmpeg/audit gates.

The final artifact and actual owner preview on 4321 match SHA-256
`2f28f1a26d338efc7cb2edf8685e62cffb1240cc6f03bf84876466de19179d89`.
Owner PID 21220 was not restarted. Chromium session 36050 passes all thirteen
compact contracts, including actual native wheel input, unchanged full copy,
positive preclip glyph/packshot bounds, real 200% computed stress, global overflow,
keyboard CTA navigation, bounded menu/close-focus/Escape restoration, actual
focused-heading sticky clearance and the old-hide sensitivity countercontrol.

Normal visual session 97544 returns fourteen passes and the one intentional
320px baseline difference. The old 320x8132 image becomes 320x8221 (+89px), with
restored description and normal-flow actions. The actual full-page image was
reviewed; no other viewport golden has been changed. Exact 320-only golden
acceptance remains pending owner review, not a blanket snapshot regeneration.

A separate twelve-context natural Full entrance probe on the preceding `09e1...`
artifact covers UZ/RU/EN, normal/200% and 320x800/240. Each captures 88–174 natural
Full frames with zero preclip packshot boundary violations and zero runtime
errors; viewport-sized menu panels, scrolling, close focus and Escape are real.
It does not force animation progress, and is not proof of every later scroll
phase or the final artifact after focus-offset-only adjustments. Its post-menu
hero screenshots can contain sticky-header overlay, so they are not pure visual
goldens. Fresh all-engine contracts and final-artifact Full/normal/zoom screenshot
controls remain separate gates before issue #17 is called resolved.

## Final cross-engine/layout milestone

Two additional findings were addressed before the final cross-engine pass:

- No-JS Firefox stalls on the page's asynchronous `document.fonts.ready` promise.
  The unchanged 7.5-second font expectation now polls synchronous status and
  native checks, plus actual registered Oswald/Onest faces with `loaded` state
  and locale-glyph Unicode coverage. A missing-family native check alone cannot
  pass this gate. Nested glyph/face readers remain self-contained for browser
  serialization; no production observer or font-policy change is introduced.
- On the same Firefox 320x240 page, with scrollY=52 and headerTop=-52, the blurred
  relative header placed its fixed menu at -52. Removing only that header filter
  changed computed backdrop-filter to none and panelTop to 0, at the same scroll
  and header position. The production fix is restricted to short compact
  relative headers; portrait/390px/desktop blur remains unchanged.

Latest full quality 54019 passes: 227 strict-check files with zero diagnostics,
117 unit tests and all previously listed artifact/security gates. File and served
owner preview match SHA-256
`4d427a2617a2e937a4a8aa4834772db391b1ffc19bca652b4e10c9c88601406c`.
All 39 unchanged compact contracts pass in Chromium/Firefox/WebKit (43134,
one worker, no skips, no timeout changes). All fifteen normal visual comparisons
pass (11256); only the specifically reviewed 320px golden was renewed, and the
other fourteen remain unchanged.

Final Full entrance/control run 34247 covers twelve contexts on this artifact:
UZ/RU/EN, normal/200% root text and 320x800/240. Explicit HeadlessChrome 151,
Windows UA, DPR **1**, root font and loaded-font metadata accompany the records.
There are 2001 naturally sampled Full frames, zero preclip packshot violations,
and twenty-four actual opposite-pointer transforms with zero boundary violations.
All viewport-sized menu panels, close focus/Escape and runtime-error records are
clean. Initial and copy-position viewport screenshots use the real UI, including
its actual header; no temporary removal of app styling conceals a composition.
This is DPR1 entrance/control evidence, not all-DPR motion-performance proof.

## Separate unresolved raster-quality and art-direction debt

The parity/layout milestone is not a crisp-image or Awwwards-final claim. Four
passive 320x240 contexts on the same artifact decode the registered 160px primary
WebP but fail the physical-source-width requirement:

| Root font | DPR  | Actual computed CSS width | Required physical width | Selected physical width |
| --------- | ---- | ------------------------- | ----------------------- | ----------------------- |
| 16px      | 1.75 | 144px                     | 252px                   | 160px                   |
| 16px      | 2    | 144px                     | 288px                   | 160px                   |
| 32px      | 1.75 | 128px                     | 224px                   | 160px                   |
| 32px      | 2    | 128px                     | 256px                   | 160px                   |

Physical width is resolved from the registered derivative filename, not
density-corrected naturalWidth. These actual CSS widths are not replaced by
earlier predicted 172/193px values. Current HTML sizes lacks the existing
short-landscape height branch and does not represent the new compact envelope
cap. Accurate metadata/envelope-linked sizes and fresh source-selection proof
remain a separate follow-up; no source change or crispness waiver is folded into
this accepted layout milestone.

Existing visual debt is also retained: the 320px Duel TAQQOSLASH CTA can break its
last H and an Atlas kicker fragments awkwardly. Those unrelated art-direction
findings and the independent material-FPS/high-DPI/Lighthouse gates are not fixed
or waived by issue #17. All diagnostic browsers are closed; owner PID 21220 and
the verified artifact remain intact.

## Superseding native-shape correction — not release-ready yet

The earlier accepted layout milestone above is superseded, not closed. Four
same-artifact causal measurements exposed an introduced framing defect:
absolute figure auto width plus left:50% shrink-to-fit constrained the image
to half the artstage width while preserving its fixed height. Computed figure
and image sizes were 144x448 at root16 and 128x502.75 at root32, with object-fit
fill; native aspect640/1666 was compressed by approximately16% and34%.
The prior bbox/overflow passes did not detect native-shape distortion.

The compact figure now explicitly derives width from height and validated native
aspect. CSS framing, responsive sizes and the unchanged authored entry/rest
motion consume a shared specification; the Back easing's real scale overshoot
is included. Actual computed image aspect, not a rotated bounding-box ratio,
has a0.5% tolerance. A second negative control first passes the normal page then
compresses the figure to50%; all three engines must reject native aspect.

On artifact02b6aebd647fec9c1a627a793e845646108a91a593c583d2a2bafa98dd3ef0f6,
quality63260 passes229 strict files,124 unit tests and the artifact/security
gates. All42 compact contracts pass across three engines (24129, one worker).
Passive native-aspect measurements improve to less than0.041% error; however
the root32/DPR1.75 case still selects320 physical pixels for338 required. This
is a real unresolved source-selection failure, not a waived quality criterion.

A bounded viewport-envelope sizes fixture passes all eight JS/noJS, root16/32,
DPR1.75/2 physical-source and native-aspect cases. The proposed SSR branch uses
that cap only for compact landscape, with no runtime observer, eager-to-lazy
hack or constant480px request. The cost is explicit:320 WebP45124B versus480
WebP93608B, a48484B increase in the previously320-selected normal/DPR1.75 case.
Fresh actual SSR transfer/budget evidence, full source quality, normal visual
comparisons and natural Full entrance/pointer preclip bounds remain pending.
No production promotion or issue closure follows from the diagnostic fixture.

Five review lenses for this correction: correctness checks actual native shape;
responsive UX retains natural text/action flow; motion checks the real shared
rotation/scale envelope and pointer corners; performance measures physical
selected source plus transfer cost; maintainability binds metadata, gutter
tokens and unchanged choreography rather than duplicating guessed constants.

## Fresh coherent correction evidence

Final SSR artifact SHA-256 (disk and owner preview match):
`3103f53045df2307a6f76b8a1e64165b5184a43cd6eb6c9e4277db331b5de149`.
Full quality 25058 passes: 230 strict-check files, 129 unit tests, 47 generated
routes, existing artifact budgets, content/font/provenance checks, 617 reviewed
SBOM components, pinned FFmpeg and no known candidate dependency vulnerabilities.
The numerical tests include three native aspect families and an interior
rotation maximum; selected-domain coverage percentages do not claim complete
coverage of the new layout factory.

Eight actual SSR cases (not sizes-attribute mutations) cover JS/noJS, root font
16/32px and DPR 1.75/2 at 320x240. All decode registered 480px WebP, with native
aspect error below 0.041%; physical width exceeds actual CSS width times DPR
(301–386px required). The image encoded body is 93,608B; transfer is 93,908B.
Observed navigation-plus-resource transfers are 208,024–241,593B with JavaScript
and 790,271–891,363B without it, with fonts loaded. Those measured contexts stay
below 900KiB; this is not universal critical-transfer or Lighthouse proof. The
normal DPR1.75 image-body delta is explicitly +48,484B versus the old 320px source.

Natural Full run 76568 covers twelve locale/root/height contexts at DPR **1**:
2,045 real sampled frames and twenty-four opposite pointer transforms, with zero
preclip packshot boundary violations, zero runtime errors and real menu close
focus/Escape. It uses native corrected image width, not the old compressed actor.
All fifteen normal visual comparisons pass before any new snapshot renewal
(84837). Root reviewed fresh normal portrait/short and RU stressed copy viewport
captures and approved renewal of the 320px golden only; other fourteen must stay
unchanged. Final cross-engine parity rebind and normal visual confirmation are
still recorded separately below when their sessions become terminal.

Known art-direction debt is explicit: stressed RU product CTA wraps ПРОДУКТЫ
mid-word; RU enlarged portrait header can reach 297px; short initial view can
mostly show the retained responsible-use warning. Alongside the earlier Duel
and Atlas fragments, these are not Awwwards-final typography claims. Independent
high-DPI/FPS/Lighthouse gates and public-main advisories are not waived here.

Final artifact-bound sessions are terminal: all 42 Chromium/Firefox/WebKit
compact contracts pass (60908), including hidden-description and native-aspect
mutation rejection. Exact approved 320-only golden renewal uses explicit all
mode after detecting that default changed-mode did not replace a within-1%
comparison. New golden SHA-256:
`ce48cbe7ea1e93b2933479784234e4081accc86ca0f1ce2335637c2abeba0f0f`.
All fifteen normal visual comparisons then pass (33169, 24.6s); the other
fourteen baselines remain unchanged. No browser remains active after this
checkpoint. These results address measured technical parts of issues #17/#20,
not the open issue #19 typography/art-direction debt or production release gates.
