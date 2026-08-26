# Scene motion contracts

## Contract format

Every production scene declares:

- semantic root: `[data-motion-scene="<id>"]`;
- visible end state before JavaScript;
- owned motion hooks;
- Full, Lite and Reduced behavior;
- activation and deactivation conditions;
- resources and deterministic cleanup;
- failure fallback;
- measurable acceptance evidence.

Scene hooks belong to the scene root. No global selector or cross-scene query is allowed.

## 00 — responsible entry

**Root:** `responsible-entry`

**Dominant idea:** a finite lime scan confirms entry without delaying it.

- Full: content visible immediately; one `260 ms` scan; confirmation compresses marker in `160 ms`.
- Lite: one `160 ms` opacity/block reveal.
- Reduced: final dialog and marker immediately.
- Activation: initial responsible-entry state only.
- Owned: dialog listeners/focus controller, one timeline, session-state subscription if introduced.
- Cleanup: revert timeline; abort listeners; restore focus only when close semantics require it.
- Fallback: fully operable semantic dialog/actions without GSAP.
- Acceptance: Continue works before timeline completes; `Escape`/Leave behavior is explicit; no nested scroll at `390 × 844`.

## 01 — navigation

**Root:** `navigation`

**Dominant idea:** a hard editorial split maps menu origin to destination.

- Full: two panels translate at most `80 px` and settle in `260 ms`.
- Lite: one panel reveals `24 px` in `160–260 ms`.
- Reduced: immediate open/closed state.
- Activation: explicit menu button only; header direction response is threshold-based.
- Owned: menu timeline, focus trap/restore, scroll-lock lease, scroll-direction observer.
- Cleanup: close semantics, restore leased body state, abort observers/listeners.
- Fallback: server-rendered navigation or native disclosure remains reachable.
- Acceptance: rapid open/close ends in last requested state; focus never leaves open menu; header never chatters on 1 px scroll changes.

## 02 — hero

**Root:** `hero`

**Dominant idea:** five bars align into one selected product signal.

- Full: bars stagger `32 ms`; can/poster resolves from one masked material cut; total `≤880 ms`; optional `3°` fine-pointer tilt.
- Lite: heading + one signal rail + `24 px` poster settle; no tilt/video autoplay.
- Reduced: poster, heading, range list and CTA in final state.
- Activation: first paint; secondary media only after LCP and capability approval.
- Owned: entrance timeline, optional pointer RAF, visibility observer, optional video controller.
- Cleanup: cancel RAF, stop/pause media, revert timeline and local variables.
- Fallback: poster is final quality; CTA and product links never wait.
- Acceptance: LCP content is not opacity-zero before setup; primary CTA remains above first scroll at `390 × 844`.

## 03 — range manifesto

**Root:** `range-manifesto`

**Dominant idea:** five independent bands lock into one system.

- Full: bands enter from two controlled axes and lock once; copy stops before reading.
- Lite: vertical band receives one finite signal rule on entry; maximum scene `150svh`.
- Reduced: stacked paper list.
- Activation: intersection/proximity; no setup before needed.
- Owned: one timeline/trigger, optional short sticky controller.
- Cleanup: revert pin/inline transforms; release reserved spacing.
- Fallback: natural document list.
- Acceptance: DOM order matches reading order; no five-layer mobile pin; scroll remains native.

## 04 — flavor explorer

**Root:** `flavor-explorer`

**Dominant idea:** selection changes one material signature while product truth stays stable.

- Full: desktop stage may pin; outgoing cut `160–260 ms`, incoming `260–640 ms`; explicit buttons and URL.
- Lite: vertical cards; selected card runs one flavor-specific finite signature.
- Reduced: immediate content switch, border/check/status feedback.
- Activation: stage proximity and explicit selection.
- Owned: selection timeline, local trigger, URL-state listener, live-region status, optional image decode AbortController.
- Cleanup: kill/revert only current selection timeline; abort pending decode; restore final selected state.
- Fallback: links/cards navigate or select server-rendered product state.
- Acceptance: rapid five-button sequence ends on last input; no drag-only path; page never overflows horizontally.

## 05 — product lab

**Root:** `product-lab`

Product overview and truth compositions use `product-lab` for finite reveals.
Product-detail routes use the separate `product-world` scene and must provide a
recognized `data-product-world` slug; an absent or unknown specification fails
the dedicated scene mount instead of silently selecting another product.

**Dominant idea:** a single light sweep maps packaging material to verified facts.

- Full: one finite sweep on product change; optional `3°` inspection tilt.
- Lite: sweep only, no tilt.
- Reduced: still product and facts.
- Activation: selected product change, not scroll repetition.
- Owned: finite timeline, optional pointer RAF, hotspot disclosure listeners.
- Cleanup: cancel RAF/timeline; remove transient inline material styles.
- Fallback: ordered detail list and real table.
- Acceptance: all facts exist outside hotspots; warning is open/visible; no repeated ambient sweep.

## 06 — product compare

**Root:** `product-compare`

**Dominant idea:** selected columns align once, then differences remain still.

- Full: column lock `260 ms`; one finite difference highlight.
- Lite: same with opacity/border only.
- Reduced: immediate table update.
- Activation: explicit selector change.
- Owned: selection timeline and status announcement.
- Cleanup: cancel prior update; preserve current data and focus.
- Fallback: server-rendered comparison form/table.
- Acceptance: no animated counters; missing data is explicit; two-product mobile table is keyboard-operable.

## 07 — material film

**Root:** `material-film`

**Dominant idea:** the film is user-controlled product material, not a forced intermission.

- Full: poster-first; play after proximity or explicit intent according to media policy; persistent pause.
- Lite: explicit Play; mobile crop; no autoplay.
- Reduced: poster or user-stepped still sequence.
- Approved still-lineup variant: when no film is present, local
  `data-motion-product` targets receive one visible-once material alignment;
  Full uses a maximum `3°` settle, Lite uses translation only, and Reduced is
  already final.
- Activation: user action is authoritative; visibility may only pause.
- Owned: media listeners, IntersectionObserver, playback promise, caption/transcript controls.
- Cleanup: pause, clear pending play handlers, remove sources where route policy requires, abort listeners.
- Fallback: final poster + transcript/error.
- Acceptance: `preload="none"` below fold; leaving viewport pauses; route change leaves no audio/video decode.

## 08 — culture signal

**Root:** `culture-signal`

**Dominant idea:** one editorial crop reveals local context, then becomes still.

- Full: fixed-frame crop shift `≤640 ms`; finite dated label transition.
- Lite: one image shift `24 px`; no ticker loop.
- Reduced: static chronological cards.
- Activation: card entry or explicit pagination only.
- Owned: intersection observer and finite timeline.
- Cleanup: disconnect observer; revert transforms.
- Fallback: normal image, date, headline, standfirst and destination.
- Acceptance: no autoplay embed; external destination is explicit; no motion competes with reading.

## 09 — store locator

**Root:** `store-locator`

**Dominant idea:** the selected flavor signal terminates at a useful result.

- Full: finite signal travel into CTA; results appear with one restrained state transition.
- Lite: border/status transition only.
- Reduced: immediate loading/result/error state.
- Activation: explicit search or filter action.
- Owned: request AbortController, timeout, result status, optional intent-loaded map adapter, one finite timeline.
- Cleanup: abort request/timeout; destroy map adapter; retain user-entered filters where route policy allows.
- Fallback: verified retailer/contact/map outbound list.
- Acceptance: duplicate submit is blocked; stale/empty/error/timeout states are distinct; map never replaces list.

## 10 — FAQ and safety

**Root:** `faq-safety`

**Dominant idea:** state change follows a native disclosure without spectacle.

- Full: one disclosure expands in `≤260 ms`; no row stagger.
- Lite: same or immediate based on measured height.
- Reduced: immediate native disclosure.
- Activation: explicit summary click/keyboard.
- Owned: local disclosure cleanup only.
- Cleanup: clear temporary inline size/clip values.
- Fallback: native `details/summary`.
- Acceptance: server-rendered answer is available; active summary is not obscured by header.

## 11 — contact and partnership

**Root:** `contact-partnership`

**Dominant idea:** finite state feedback makes submission status unmistakable.

- Full: intent panel transition `260 ms`; submit state uses finite label/border change.
- Lite: opacity/border state only.
- Reduced: immediate fields/status.
- Activation: explicit intent selection and submit.
- Owned: request AbortController/timeout, validation status, finite timeline.
- Cleanup: abort outstanding request; keep user data unless success policy clears it; never log PII.
- Fallback: verified contact destinations.
- Acceptance: double submit cannot race; loading, error, retry and success are announced; motion is not the only feedback.

## 12 — footer

**Root:** `footer`

**Dominant idea:** five finite rails collapse into one closing line.

- Full: one `640 ms` collapse on first entry.
- Lite: one `260 ms` line alignment.
- Reduced: final line immediately.
- Activation: first intersection only.
- Owned: one finite timeline and observer.
- Cleanup: disconnect observer; revert timeline to final readable state.
- Fallback: static closing line, navigation, warning and controls.
- Acceptance: motion setting remains operable; no placeholder link; warning never moves while read.

## Cross-scene race policy

### Rapid interaction

The owning feature stores the current semantic selection independently of GSAP. A new action:

1. updates semantic state and URL;
2. cancels/reverts the feature’s current transition;
3. starts at the current visual position when practical;
4. resolves to the latest semantic state;
5. never queues unbounded transitions.

### Navigation during motion

Route ownership destroys scene registry before the old DOM is released. Cleanup failures are surfaced through the structured diagnostics boundary, but all remaining cleanup still runs.

### Capability change

The current semantic state is captured, owned scenes are destroyed, and the new tier mounts from that state. No full-page reload is required.

### Resize

Responsive rebuilding is debounced at the orchestration boundary. Scene-local ResizeObservers watch only structural roots and cannot call global refresh on each observation.

## Runtime hook mapping

All hooks are optional progressive-enhancement targets. Server-rendered
content is the final readable state when a hook is absent or JavaScript fails.

| Scene                   | Supported owned hooks                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| responsible entry       | `data-motion-signal`, `data-motion-copy`                                                                        |
| navigation              | `data-motion-menu`                                                                                              |
| hero                    | `data-motion-signal`, `data-motion-copy`, `data-motion-product`                                                 |
| range manifesto         | `data-motion-signal`, `data-motion-copy`                                                                        |
| flavor explorer         | `data-motion-reveal`, `data-motion-select`, `data-motion-selected`                                              |
| product lab             | `data-motion-product`                                                                                           |
| product compare         | `data-motion-reveal`, `data-motion-select`, `data-motion-result`                                                |
| material film           | `data-motion-product` still lineup, or `data-motion-media`, `data-motion-media-play`, `data-motion-media-pause` |
| culture signal          | `data-motion-reveal`                                                                                            |
| store locator           | `data-motion-reveal`, `data-motion-select`, `data-motion-result`                                                |
| FAQ and safety          | native `details`/`summary`; no visibility dependency                                                            |
| contact and partnership | `data-motion-reveal`, `data-motion-select`, `data-motion-result`                                                |
| footer                  | `data-motion-signal`, `data-motion-copy`                                                                        |

Feature code owns semantic state. It may dispatch the bubbling
`gorilla:selection-change` event from the scene root after synchronously
committing a selected product or result. The motion layer cancels a pending
frame and the previous transition before animating the latest rendered target.

## Release evidence

Each scene’s PR must include:

- Full/Lite/Reduced capture;
- JS-off capture;
- keyboard trace;
- cleanup test;
- rapid-input test where stateful;
- target-mobile performance trace where animated;
- documented owned listeners, observers, media and triggers;
- no console/page errors after 20 mount/unmount cycles.
