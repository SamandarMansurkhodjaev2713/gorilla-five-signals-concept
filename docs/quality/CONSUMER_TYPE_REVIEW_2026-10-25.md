# Consumer type and responsive action review — 2026-10-25

## Outcome and acceptance

Remove the redundant English calibration eyebrow from the range, restore a
proper mobile heading hierarchy, and keep store/contact actions readable in all
three languages. Preserve product content, all five worlds, keyboard/native
controls, the warning and the established visual identity. This is refinement,
not new marketing positioning or a new visual world.

## Changes and five review lenses

1. **Correctness and edge cases.** Keep the existing localized `chooseSignal`
   heading. Delete `02 / Five frequencies`; no replacement claims are invented.
   Mobile heading owns its full row at 32–48px instead of an 18.4px narrow
   column. Bounded grid tracks and word wrapping preserve enlarged text.
2. **Architecture and ownership.** Layout stays in feature CSS; remove the dead
   eyebrow rules. No runtime, animation lifecycle, route/reload ownership or
   production event handler changes. Native disclosure tests use a small shared
   hit-tested input helper rather than duplicated activation code.
3. **UX and accessibility.** Actual WebKit exposed 28px overflow in the UZ store
   heading after fonts were already loaded. Its `ch` cap was too narrow. The
   same contract subsequently exposed 46px overflow in the contact heading.
   Mobile actions now use the available content width, bounded grid tracks and
   fluid type with explicit wrapping. The rendered 320px store title also
   exposed cramped multiline leading: mobile action line height is now 0.95,
   with an explicit numerical regression assertion. Native one-line contact,
   two-line store, keyboard and no-JS assertions are retained, not relaxed.
4. **Performance and security.** Compact Hero `sizes` now uses its actual 40svh
   ceiling; wider phones retain 48svh and the existing landscape/rotation caps.
   No new dependencies, media, endpoints, state or secrets. This aligns an image
   hint; it does not establish a byte saving or a frame/Lighthouse improvement.
5. **Maintainability and release.** Point-edit copy follows the Copywriting
   skill; Impeccable guided full-row hierarchy and native-size visual inspection.
   Source, browser, visual and functional evidence remain separate. Main/Pages
   and full release/performance acceptance remain held.

## Native disclosure investigation

Initial WebKit no-JS footer activation failed. A diagnostic showed that scrolling
directly to a descendant of an unrendered `content-visibility:auto` footer could
leave the viewport at y=0 while the summary remained at y=8091.72. Scrolling the
footer owner first produced a stable summary at y=560.72–604.72; its center
hit-tested to the actual summary and a real mouse click opened the disclosure.
Forcing the footer to `content-visibility:visible` was tested and rejected: it
did not by itself make the initial automated click reliable. Production footer
rendering is unchanged.

The test now visits the owner, polls bounded stable hit-tested geometry, uses
native mouse input, and requires the actual `open` attribute before checking
links/notes. It never forces a click, calls `element.click()`, mutates `open`,
disables a covering element or weakens visibility assertions. Font readiness uses
the existing synchronous loaded-face/glyph contract, which also works with page
JavaScript disabled. Two private diagnostic attempts with disabled-JS promise
helpers were stopped by closing only their verified owned WebKit processes;
the corrected diagnostic uses synchronous isolated-world observations.

## Evidence and iteration record

- Native installed Chrome range captures: 320 UZ / 390 RU / 430 EN / 1440 UZ.
  Heading sizes are 32 / 32 / 34.4 / 28.8px; zero horizontal overflow and no
  uncaught page errors in these samples. Main reviewer inspected all four.
  `.tmp/range-intro-confirmation-2026-10-25/`.
- Native Chrome and patched WebKit action captures cover 320 UZ / 390 RU / 430
  EN. Main reviewer inspected compact UZ Chrome and RU WebKit store/contact
  pairs, then corrected the confirmed compact leading defect.
  `.tmp/consumer-actions-confirmation-2026-10-25/`.
- Initial 48-case run: 44 passes, three store overflow failures and one native
  footer activation failure. Intermediate runs retained the contact-width and
  no-JS hit-testing failures, rather than suppressing them.
- A later clean 48-case run passed across all three engines before the final
  line-height strengthening. `.tmp/consumer-heading-final-pass-2026-10-25.log`.
- All 42 existing Flavor Reactor functional cases pass in Chromium: seven
  viewport contexts, five products, keyboard/history, interrupted input, reduced
  motion and no-JS parity. `.tmp/reactor-heading-functional-2026-10-25.log`.
- The first new image-hint unit test found its own faulty branch delimiter:
  the general landscape substring also occurs inside the earlier compact branch.
  Searching after the compact branch fixes the test; priority assertions remain.
  Failed initial source logs are retained privately.

Final source quality passes: 273 strict files, 249 unit tests, 47 built pages,
artifact/font/provenance/SBOM checks and zero known dependency vulnerabilities in
this candidate. `.tmp/quality-consumer-type-final-2026-10-25.log`.
The strengthened final 48-case browser run passes without retries or skips:
`.tmp/consumer-type-final-2026-10-25.log`. Final 320px Chrome/WebKit line-clearance
captures are in `.tmp/consumer-actions-line-clearance-2026-10-25/`; main reviewer
inspected both store headings and the WebKit contact panel after the correction.
All 42 functional Reactor cases also pass again against the final built artifact:
`.tmp/consumer-type-reactor-final-2026-10-25.log` (one worker, no retries/skips).

Patched WebKit does not prove physical Safari/iPhone behavior;
device/assistive-technology checks and the failed startup/Lighthouse budgets
remain open. A read-only architecture audit identifies staged, fully awaited,
lifecycle-owned immediate-scene activation as the next performance investigation;
that proposal is not implemented or accepted by this typography change.
