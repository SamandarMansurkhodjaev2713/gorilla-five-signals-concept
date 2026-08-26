# Signal Boot and route continuity review

Date: 2026-08-11

Scope: responsible entry, route-transition presentation, navigation focus and
scroll lifecycle

## Outcome and acceptance criteria

The responsible checkpoint is now an authored Signal Boot rather than a generic
dialog. It remains a real, immediately operable modal: no timer, media, font,
GSAP import or artificial progress state delays confirmation. The checkpoint is
present on localized product and campaign routes, while localized legal routes
remain directly readable so the product-information link cannot create a gate
loop.

Same-origin links use Astro's static-first client router with a short persisted
five-rail signal. Navigation remains a normal anchor contract, unsupported
browsers use an immediate swap, Reduced Motion disables spatial presentation,
and the route controller never delays the router loader.

Acceptance evidence required:

- checkpoint actions remain usable before the scan completes;
- Escape preserves the modal and focuses the explicit leave path;
- confirmation stores session state, closes immediately and focuses `main`;
- direct deep links receive the checkpoint, but legal routes do not;
- 390×844, 1024×768 and 1440×900 keep all entry copy/actions in the viewport;
- route races resolve to the last requested URL without a retained overlay;
- route focus lands on the destination `h1` and Back restores scroll;
- motion preference and system Reduced Motion disable the spatial signal;
- navigation and responsible-entry scene order remains deterministic;
- complementary landmarks have unique accessible names.

## Five review lenses

### 1. Correctness and edge cases

Evidence: `entry-transition.spec.ts` covers unconfirmed deep entry, immediate
confirmation, Escape, legal bypass, Full-motion route races, Reduced Motion and
the three critical viewports. The focus request stores the destination URL
rather than a boolean, so an aborted intermediate route cannot consume focus
intended for the final route. Invalid stored URLs are rejected and removed.

Correction made: the first race test exposed focus being consumed by the first
of two rapid navigations. Destination-path matching replaced the stale boolean
request.

### 2. Architecture, coupling and cleanup

Evidence: `route-transition.ts` owns one AbortController and one bounded reset
timer. A new navigation increments its generation and replaces the previous
phase. `destroy()` aborts listeners, clears the timer and restores the idle
state. Presentation queries only its explicit `data-route-*` hooks. The
responsible-entry controller owns and cancels its release timer and animation
frames.

Correction made: the transition controller was decomposed into focused helper
functions and a lifecycle coordinator. No dependency, global feature selector,
GSAP wait or feature-level global cleanup was introduced.

### 3. UX, responsive behavior and accessibility

Evidence: live captures at 390×844, 1024×768 and 1440×900 were inspected after
automated geometry checks. The mobile title uses a dedicated 0.98 line height;
desktop keeps the content in two balanced columns down to 896 px. The viewport
contract verifies header, age mark, title, warning, language, actions and legal
link stay inside the viewport without dialog scrolling at all three sizes.

Correction made: the first visual pass allowed the desktop age mark to displace
copy below the fold and compressed the mobile title too tightly. Both were
recomposed before acceptance. Axe checks now pass for `uz/find` and
`ru/products/zero`; the responsible marker has a localized unique landmark
name. Confirmation focuses the stable main landmark, while route navigation
focuses the new heading.

### 4. Performance, security and dependency risk

Evidence: no dependency, network request, media asset or runtime font wait was
added. Entry and route presentation use bounded transform/opacity animations.
The route code label is derived from the parsed destination URL, restricted to
a short alphanumeric value and assigned with `textContent`. Legal warning copy
continues to come from the approved localized content collection.

Correction made: the UI Pro design-system suggestion to use glass/blur was
rejected because it conflicts with the industrial visual thesis, risks text
contrast and adds avoidable paint cost.

### 5. Maintainability, documentation and release readiness

Evidence recorded on 2026-08-11:

- focused Prettier check: passed;
- full ESLint: passed with zero warnings;
- Astro typecheck: 146 files, zero errors/warnings/hints;
- production build: 47 static pages, passed;
- bundle budget: homepage initial JavaScript 9,754 B gzip and initial transfer
  33,477 B gzip, both within project limits;
- entry and route lifecycle Chromium E2E: 8/8 passed;
- responsible-entry focus plus 20-cycle scene identity tests: 2/2 passed;
- targeted Axe (`uz/find`, `ru/products/zero`): 2/2 passed.

No release claim is made for Lighthouse, full cross-browser visual regression
or the complete route matrix; those remain project-level release gates rather
than evidence inferred from this focused change.
