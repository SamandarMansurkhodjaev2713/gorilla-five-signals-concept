# Public review update — 2026-10-25

## Scope and status

The user requested immediate publication of the current portfolio concept.
This is an incremental public review update, not completion of the broader
Awwwards-level implementation goal. Do not describe it as commissioned by Gorilla
or as a fully approved commercial release.

Included changes preserve native product-image proportions, complete mobile
hero copy, keyboard navigation, reduced-motion and no-script paths. The
typography refinement keeps Oswald/Onest and canonical localized copy, gives
the Duel action a full label row, and introduces discretionary lexical breaks
instead of accidental one-character fragments. Duel now opens the products
actually shown in its preview: Original and Lychee Pear.

The compact header caps only its non-text logo width and spacing; user-scaled
text is not shrunk. The measured enlarged Russian header changes from 297px to
185px. No-script menu closing uses a real same-page navigation link rather than
an inert JavaScript-only button.

## Five review lenses

1. Correctness: canonical labels are validated before lexical segmentation;
   real navigation checks preserve the preview pair and URL query.
2. Architecture: CSS owns layout; no text-fitting observers, additional font
   families, application dependencies or global motion cleanup were added for
   these layout changes.
3. UX and accessibility: test native words and painted glyph bounds, 200% root
   text plus text spacing, real keyboard routes, no-script menu close and
   reduced motion. Old layout mutations must make their contracts fail.
4. Performance and security: retain existing artifact budgets and separately
   re-audit dependencies at release time; old green audit results are not
   evidence about today's vulnerability database.
5. Maintainability and release: preserve upstream license records, generated
   lock/SBOM integrity and version-pinned native-transition regression tests;
   publish through protected pull-request checks, not a force push.

## Evidence and known limits

Source checks before the dependency refresh: 236 strict-check files with zero
diagnostics, 135 unit tests and 47 generated routes passed. Artifact, provenance,
font, license and host-media checks passed. The fresh dependency audit then
failed with 17 advisories, including three high-severity entries. This failure
requires corrected dependencies and a new audit; it is not waived.

The earlier mobile checkpoint and its historical measurements are recorded in
`docs/quality/COMPACT_HOME_PARITY_2026-10-14.md`. New browser verification and
deployment status must refer to the final integrated commit, not that older
artifact.

Remaining work includes measured LCP/CLS headroom, high-density WebKit Full-motion
performance, the full release matrix, physical-device and assistive-technology
checks, and final visual/legal screenshot approval. Publication does not close
those gates or the active implementation goal.

## Deployment and recovery

GitHub Pages builds the protected `main` branch using `PUBLIC_RELEASE_MODE=public`
and the repository base path. Verify the deployment run's head commit, HTTPS,
localized homepage, product atlas, product detail and comparison route, plus
same-origin stylesheet, script and image responses after rollout.

Previous public baseline: `784a2b14a15bd486abd39dc68f8ca8d10b9a7604`.
Recovery is a normal reviewed revert of the release commit followed by the Pages
workflow. Do not reset or force-push `main`; retain security fixes where possible
instead of blindly reintroducing the older dependency graph. No rollback drill
or external-device validation is claimed by this document.
