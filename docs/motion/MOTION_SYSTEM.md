# Motion system

## Motion thesis

Motion behaves like a calibrated industrial signal, not a layer of entertainment placed over the page.

Every movement must answer one question:

- what was selected;
- what changed;
- where content came from or goes;
- which material is being inspected;
- when the interface is ready.

The motion language uses hard directional alignment followed by stillness. Reading pauses movement. Each viewport contains no more than two independently moving focal elements.

## Explicit exclusions

- no custom cursor;
- no infinite marquee;
- no smooth-scroll library;
- no global scroll interception;
- no perpetual ambient drift;
- no fake loading percentage;
- no mandatory intro;
- no autoplay audio;
- no scroll-scrubbed body copy while it must be read;
- no global selector inside a scene;
- no `ScrollTrigger.killAll()`;
- no feature teardown of resources owned by another feature.

## Capability policy

```ts
type MotionCapability =
  | { kind: "full"; reason: "capable-fine-pointer" | "user-enabled" }
  | { kind: "lite"; reason: "touch" | "data-saver" | "user-selected" }
  | {
      kind: "reduced";
      reason: "system-preference" | "user-disabled" | "runtime-fallback";
    };
```

Priority:

1. explicit in-site Reduced;
2. explicit in-site Lite;
3. explicit in-site Full;
4. system reduced-motion;
5. data saver;
6. coarse pointer;
7. Full.

Device evidence may only lower the automatic tier. No user-agent sniffing is allowed. Capability changes rebuild owned scenes into the same semantic state; they do not reset selected product, URL, form, disclosure or focus.

### Full

For capable fine-pointer environments or explicit opt-in:

- authored entrance;
- bounded ScrollTrigger timelines;
- one product material transition;
- limited pointer-responsive tilt where it adds inspection value;
- native View Transition enhancement;
- poster-first film after capability and visibility gates.

### Lite

Default touch/data-saver choreography:

- no pointer tilt;
- no long pins;
- maximum local transform distance `48 px`;
- no mobile video autoplay;
- product transitions are one finite cut;
- transforms and opacity only;
- same content and actions.

### Reduced

- remove parallax, scrub, rotation, pinning, mask travel and autoplay decorative film;
- preserve state feedback through immediate content, border, selected icon and optional `80 ms` opacity;
- do not animate a focus target away;
- page and scene transitions become immediate or a short opacity change;
- no timeline is required for content visibility.

## Timing tokens

Source: `src/motion/tokens.ts` and mirrored CSS custom properties.

| Token             |    Value | Use                             |
| ----------------- | -------: | ------------------------------- |
| `instant`         |  `80 ms` | pressed/state confirmation      |
| `quick`           | `160 ms` | hover/focus/control fill        |
| `standard`        | `260 ms` | disclosure and local reveal     |
| `scene`           | `640 ms` | material cut and scene entrance |
| `entranceMax`     | `880 ms` | absolute first-view cap         |
| `staggerTight`    |  `32 ms` | adjacent signal bars            |
| `staggerStandard` |  `48 ms` | short finite groups             |

### Easing roles

- `enter` / `power4.out` — decisive arrival;
- `exit` / `power3.in` — shorter departure;
- `material` / `expo.out` — light/crop movement;
- `snap` / `power3.out` — selected state alignment;
- `settle` / constrained back easing — tiny non-spatial feedback only.

Linear easing is allowed only for a real progress indicator. Repeating animation is not used for decoration.

## Spatial tokens

| Token            |        Value | Constraint                      |
| ---------------- | -----------: | ------------------------------- |
| control pressure |   `2 px` max | no surrounding layout shift     |
| copy reveal      |  `24 px` max | Lite and compact                |
| panel reveal     |  `48 px` max | one local panel                 |
| scene reveal     |  `80 px` max | Full desktop                    |
| product tilt     |     `3°` max | fine pointer, one product still |
| material cut     |     `8°` max | masked media, not readable copy |
| mobile pin       | `150svh` max | most scenes use no pin          |

## Sequence grammar

An authored scene follows this order:

1. **truth** — semantic final content exists before the timeline;
2. **signal** — one rail, band or crop establishes direction;
3. **material** — product/media resolves;
4. **label** — state and action become visually explicit;
5. **rest** — movement stops before reading.

Timelines never hide critical content by default. JavaScript adds an enhancement class only after setup succeeds; CSS without that class is the readable end state.

## Control motion

### Buttons

- hover/focus: finite signal fill, `160 ms`;
- press: `translateY(1px)`, `80 ms`;
- loading: semantic disabled/busy state and explicit label;
- success/error: one state transition, no celebration loop;
- Reduced: immediate color/border state.

### Links

Underline scans from `16%` to full width in `260 ms`. It appears for both hover and focus. The action remains underlined or otherwise identifiable without motion.

### Product selection

The semantic selected state and URL update synchronously. Motion is an after-effect:

- outgoing material exits in `160–260 ms`;
- incoming material resolves in `260–640 ms`;
- rapid input cancels/replaces only the selector’s owned timeline;
- final state matches the last input;
- focus never follows an animated can.

### Disclosure

Prefer native open/closed semantics. If enhanced, measure the target once, animate a clip/transform proxy or an explicitly bounded height, then clear inline styles. Reduced changes immediately.

## Page and route transitions

Native View Transitions are progressive enhancement:

1. normal link navigation is always valid;
2. outgoing page uses one five-signal shutter, no screenshot blur;
3. flavor route may preserve signal color continuity;
4. transition duration is `≤640 ms`;
5. new page focus lands on `h1`;
6. browser back/forward keeps sensible scroll restoration;
7. Reduced skips the shutter;
8. transition failure falls back to normal navigation.

No link waits for GSAP or media.

## Loading and media

The final poster is the loading state.

- hero poster and heading paint immediately;
- first entrance starts only when essential DOM is present;
- fonts may cause one coordinated refresh after `document.fonts.ready`;
- video below fold uses `preload="none"`;
- proximity may prepare the poster, not decode the whole film;
- play occurs by user intent on touch/data saver;
- media pauses outside the viewport and on hidden document;
- route teardown pauses, removes listeners and releases sources where appropriate;
- errors expose a message/retry without blank space.

An indeterminate spinner is allowed only for a real operation. The product experience itself never displays a fake percentage.

## Lifecycle contract

`src/motion/create-scene.ts` is the ownership boundary.

Every scene receives:

- one local root;
- current capability;
- local `query`/`queryAll`;
- one GSAP context scoped to the root;
- one GSAP match-media instance scoped to the root;
- one AbortSignal;
- helpers for listeners, observers, cleanup and animation frames.

Rules:

1. scene setup is synchronous and returns optional teardown;
2. every listener is attached with the scene AbortSignal;
3. every observer is registered through `ownObserver`;
4. every RAF is registered through `requestFrame`;
5. timers, media, timelines and non-GSAP resources use `onCleanup`;
6. cleanup is idempotent;
7. cleanup runs in reverse ownership order;
8. one failing cleanup does not prevent remaining cleanup;
9. cleanup errors are aggregated and reported to the application boundary;
10. a scene cannot unmount another scene;
11. the registry rejects duplicate IDs;
12. a destroyed registry rejects and destroys late mounts.

The motion engine is dynamically imported in the browser and cached. A failed import clears the cache so a deliberate retry is possible.

### Local selector rule

Allowed:

```ts
context.query<HTMLElement>("[data-motion-copy]");
```

Prohibited:

```ts
document.querySelector(".hero-copy");
gsap.utils.toArray(".reveal");
```

Feature selectors use `data-motion-*` hooks. Style classes are not motion contracts.

## ScrollTrigger rules

- only Full desktop uses scrub where continuity cannot be expressed with an entrance;
- mobile Lite uses intersection/finite transitions or unpinned triggers;
- start/end are named scene specifications, not scattered strings;
- pin spacing is deliberate and inspected with JS off;
- refresh occurs once after fonts and LCP media settle, plus debounced structural changes;
- no refresh on every resize event;
- scenes kill/revert only triggers created in their own GSAP context;
- `ScrollTrigger.killAll()` is prohibited;
- a resize/capability change restores semantic state before rebuilding choreography.

## Performance rules

- animate transform and opacity;
- CSS custom-property animation is allowed only when it does not trigger layout/paint hotspots;
- no animation callback performs interleaved DOM read/write per frame;
- pointer response is sampled with one RAF and stops outside the root;
- no scene creates an unbounded loop;
- pause media/timelines outside visibility;
- keep application work (`scriptDuration + styleAndLayoutDuration`) at or below
  `16 ms` inside every observed long animation frame;
- keep long-animation-frame `blockingDuration` at or below `16 ms`;
- no animation long task above `50 ms`;
- no measured Event Timing interaction above `200 ms`;
- retain render/presentation duration for diagnosis without calling it
  application work;
- Lite stays above 50 fps on target mid-tier Android;
- memory returns to a stable plateau after 20 navigation/resize cycles.

## Accessibility rules

- animation never changes DOM/focus order;
- focus indicators do not animate away;
- critical state feedback is not color-only;
- user motion setting is available from navigation and footer;
- Pause/Play exists for moving media;
- content moving longer than five seconds is absent by default; if later introduced it requires Pause;
- reduced-motion is tested before and after hydration;
- screen-reader announcements describe state, never the choreography;
- animated intermediate colors and media overlays still meet contrast.

## Verification protocol

For every scene:

1. inspect server-rendered end state with JS disabled;
2. test Full, Lite and Reduced using deterministic QA overrides;
3. trigger rapid input and verify last intent wins;
4. resize through every composition boundary;
5. unmount/remount 20 times and inspect listeners, observers, triggers and media;
6. navigate during animation;
7. fail fonts, image, video and dynamic GSAP import;
8. verify keyboard focus before, during and after motion;
9. record mobile frame-time trace;
10. capture static screenshot without relying on a hidden production state.

## Implemented runtime contract

Entry point: `src/scripts/motion-runtime.ts`.

The site layout imports that browser module once. It owns the page lifecycle:

1. mount after the initial DOM is ready;
2. destroy the existing runtime before `astro:before-swap`;
3. mount the next document at `astro:page-load`;
4. invalidate an in-flight dynamic import before accepting a late result;
5. release scene resources in reverse ownership order;
6. publish structured failures through `gorilla:motion-diagnostic`.

The runtime writes the effective tier to
`<html data-motion-tier="full|lite|reduced">`. It also records the diagnostic
reason in `data-motion-reason`. A GSAP import or unexpected startup failure
falls back to the readable Reduced state and records `runtime-fallback`; content
and controls never wait for the engine.

### Global preference controls

- `[data-motion-toggle]` toggles between the explicit Reduced preference and
  System behavior;
- `[data-motion-preference="system|full|lite|reduced"]` exposes a four-way
  preference control when the UI needs it;
- `aria-pressed` is synchronized on every matching control;
- the preference is stored under the versioned key
  `gorilla:motion-preference:v1`;
- blocked storage falls back to in-memory state and emits a structured
  diagnostic;
- changing preference rebuilds owned scenes without changing product, URL,
  disclosure, form or focus state.

### Production hook vocabulary

| Hook | Ownership and purpose |
| --- | --- |
| `data-motion-scene="<id>"` | unique scene root on the current page |
| `data-motion-copy` | bounded label/copy entrance within its scene |
| `data-motion-signal` | finite rail or signal alignment |
| `data-motion-product` | can or product-material target |
| `data-motion-reveal` | finite card/section child reveal |
| `data-motion-select` | explicit selection input or link |
| `data-motion-selected` | currently selected visual target |
| `data-motion-result` | result panel that follows semantic state |
| `data-motion-menu` | native menu/disclosure visual target |
| `data-motion-media` | scene-owned video or audio |
| `data-motion-media-play` | explicit media play control |
| `data-motion-media-pause` | explicit media pause control |

Missing optional hooks are a supported no-op. A missing scene root means no
setup, import, listener or error for that scene. Duplicate roots for one scene
ID are rejected and diagnosed because ownership would otherwise be ambiguous.

Scene code queries only below its supplied root. Document-wide root and
preference-control discovery occurs only in the lifecycle orchestrator, never
inside feature choreography.
