# Hero first-fold correction — 2026-10-25

## Acceptance and scope

Keep the approved industrial-editorial identity and mandatory warning. Make the
primary action fully available on ordinary phone, tablet and desktop viewports,
without hiding it behind entry choreography. Short landscape and enlarged text
must retain ordinary scrolling and complete content, not be forced into one fold.

## Confirmed defect and correction

The original 390×844 RU action ended at y=877.59, below the viewport; the
1440×900 UZ action ended at y=932. The 320×800 UZ action ended at y=799.48,
leaving effectively no clearance. Phone scene height did not account for the
warning above it, and desktop bottom-aligned controls also lacked clearance.

Use existing spacing tokens for viewport clearance and a shorter phone headline
gap, preserving display font sizes. Compact phones use a 40svh packshot ceiling
and padding-matched scene reserve; width/animation envelopes and natural flow
remain. Desktop controls move up by the existing 48px spacing token. Move the
support-animation attribute to the intro paragraph: its sibling actions are no
longer hidden by a motion-owned ancestor during entry.

Native Chrome screenshots after the change show action bottoms at y=718.73
(320×800 UZ), y=797.59 (390×844 RU) and y=884 (1440×900 UZ). All four sampled
contexts, including 844×390 landscape, have zero horizontal overflow and no
uncaught page errors. Landscape retains ordinary scrolling. These are layout
measurements, not frame-rate or performance-budget results.

Private before/after artifacts: `.tmp/home-responsive-review-2026-10-25/` and
`.tmp/home-responsive-confirmation-2026-10-25/`. Main reviewer inspected the
three corrected portrait/desktop Hero images at native viewport sizes.
An independent design-agent review of the same three images and source diff
found no new CTA cropping or product obstruction. The existing SSR image sizes
hint still conservatively describes the wider-phone 48svh ceiling on compact
phones; the new 40svh paint size can over-request pixels. This is not a crop or
blur, but remains a separate asset-sizing optimization, not a claimed saving.
Follow-up: the compact 40svh SSR hint is now aligned in the
[consumer type correction](CONSUMER_TYPE_REVIEW_2026-10-25.md); wider-phone and
landscape branches retain their distinct limits.

## Five review lenses

1. **Correctness:** preserve all copy and links; require first-fold 44px actions
   at eight ordinary viewports in UZ/RU/EN. Existing short-landscape, no-JS and
   200% text-spacing stress contracts remain mandatory.
2. **Ownership:** CSS handles layout; no new event listeners, timers, animation
   drivers or dependencies. Existing Hero presentation rollback must still pass.
3. **UX/accessibility:** no warning removal, font-size reduction or hidden intro.
   Compact native aspect and full line bounds remain tested. A mutation fixture
   now halves the observed packshot width, rather than using 50% of its parent:
   after the smaller responsive art size, that percentage no longer reliably
   compresses the image and produced a vacuous negative-control failure.
4. **Performance/security:** no new assets or network surface. Availability of
   the action improves independently of entry timing. Existing failed motion and
   Lighthouse budgets are not waived or represented as fixed by this change.
5. **Release:** branch-only correction. Main/Pages publication and the draft PR
   remain held; full device, assistive-technology and release acceptance stay open.

## Validation

`quality:pages` passes: 271 strict files, 248 unit tests, 47 built pages,
artifact/font/provenance/SBOM verification and dependency audit (zero known
vulnerabilities). Transcript: `.tmp/quality-first-fold-2026-10-25.log`.
Final changed test fixtures also pass focused ESLint/Prettier checks.

The initial 129-case Chromium/Firefox/WebKit run recorded 125 passes and four
failures: the old non-compressing negative-control fixture in all three engines,
plus one Firefox route-response failure during a concurrent artifact rebuild.
Do not rebuild the served artifact during future browser runs. After the build
completed, all six focused confirmation cases pass: deterministic compression
rejection and UZ 320×800 first-fold availability in all three engines. No assertion
was weakened and no retry was configured. This provides passing coverage of the
129 distinct cases across two runs, not a claim of one clean 129-case run.

Private browser artifacts: `.tmp/hero-first-fold-contract-2026-10-25/` and
`.tmp/hero-first-fold-confirmation-2026-10-25/`. Physical Safari/mobile and general
performance acceptance are not established by these patched-engine contracts.
