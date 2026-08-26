# Motion runtime implementation review

- Review date: 2026-07-27
- Scope: `src/motion/**`, `src/scripts/motion-runtime.ts`
- Verification environment: strict TypeScript, repository ESLint, Astro check

This review records five required criticism-and-improvement passes. A pass is
accepted only when it changed the implementation or produced repeatable
evidence.

## Pass 1 — correctness and race conditions

### Criticism

A capability change can occur while the GSAP chunk is loading. A late import
must not mount an obsolete Full scene after the user selected Reduced or the
page was destroyed. Rapid product input must not queue transitions against the
previous DOM state.

### Improvement

- added a monotonically increasing runtime generation;
- invalidated the generation on every rebuild and destroy;
- ignored stale engine resolutions;
- scheduled selection choreography one frame after semantic handlers;
- canceled the pending frame and previous owned transition before the latest
  transition;
- rejected duplicate scene IDs instead of silently sharing ownership.

### Evidence

The strict typecheck accepts all race branches without non-null assertions or
unchecked state casts. The runtime contains no unbounded queue, interval or
animation loop.

## Pass 2 — ownership, cleanup and route lifecycle

### Criticism

Page transitions, visibility observers, media listeners, pointer frames and
GSAP contexts are common leak sources. A cleanup exception must not leave later
resources alive.

### Improvement

- retained the existing scene ownership boundary with AbortSignal listeners,
  GSAP context, match-media context, owned observers and RAF cancellation;
- added one environment owner for the deferred-mount observer and scene
  registry;
- destroy now invalidates pending work before releasing the environment;
- scene registry and cleanup stacks attempt every owned release and aggregate
  failures;
- Astro `before-swap` destroys before old DOM release and `page-load` mounts
  the new document;
- media pauses on invisibility, Reduced preference and teardown.

### Evidence

Targeted ESLint reports zero findings for `src/motion/**/*.ts` and
`src/scripts/**/*.ts`. There is no `killAll`, global feature query or unmanaged
timer.

## Pass 3 — UX, accessibility and Reduced behavior

### Criticism

An enhancement that begins from hidden critical content, treats touch as
desktop, or exposes a visual-only pause would fail the project contract.

### Improvement

- kept server HTML in its readable final state;
- made absent hooks a safe no-op;
- mapped coarse pointer and data saver to Lite;
- made system or explicit Reduced require no GSAP timeline;
- standardized `[data-motion-toggle]` with synchronized `aria-pressed`;
- synchronized the effective tier on `<html data-motion-tier>`;
- paused scene media when Reduced becomes active;
- provided a finite, visible-once approved-can lineup when the material scene
  intentionally has no video, with no invented autoplay requirement;
- preserved native links, forms, details and media controls as the authority.

### Evidence

Reduced initialization does not call `loadMotionEngine`. Control state is
semantic and queryable by the QA harness. Scene animation never changes DOM or
focus order.

## Pass 4 — performance, failure and security

### Criticism

Eager GSAP, below-fold setup, pointer work on every raw event, blocked storage,
or a rejected media promise could create budget, reliability or unhandled
promise failures.

### Improvement

- dynamically imports and caches GSAP plus ScrollTrigger;
- defers non-critical scene setup to a 320 px proximity boundary;
- samples hero pointer input with at most one owned RAF;
- limits choreography to finite transform/opacity timelines;
- handles the media `play()` promise;
- converts engine failure into a readable Reduced runtime fallback;
- catches storage access and uses a memory fallback;
- publishes structured diagnostics without production console output.

### Evidence

There is no autoplay request, perpetual animation, fire-and-forget rejection,
PII logging or direct dependency on storage availability in the motion layer.
Bundle and runtime traces remain release gates for final integrated pages.

## Pass 5 — maintainability and integration readiness

### Criticism

Undocumented selector conventions or motion tied to style classes would make
feature integration fragile. Generic selectors could accidentally reach into
another scene.

### Improvement

- defined a closed 13-scene ID union;
- mapped every scene ID to one focused setup;
- documented the complete `data-motion-*` hook vocabulary;
- kept every scene query rooted in the supplied scene element;
- isolated global root/control discovery in the orchestrator;
- exported runtime, diagnostics and preference contracts from one public
  module;
- added a stable custom selection event for framework-independent integration.

### Evidence

Commands run after all five improvements:

```text
corepack pnpm exec prettier --write "src/motion/**/*.ts" "src/scripts/**/*.ts"
corepack pnpm exec eslint "src/motion/**/*.ts" "src/scripts/**/*.ts" --max-warnings 0
$env:NAPI_RS_FORCE_WASI='1'; corepack pnpm exec astro check
```

Result: formatting completed, targeted ESLint passed with zero warnings, and
Astro check reported zero errors, warnings or hints.

## Integrated release evidence

The final application now provides:

- Full/Lite/Reduced behavior and persistent pause coverage;
- six responsive visual baselines;
- JavaScript-off and keyboard journeys;
- rapid preference/selection behavior and twenty resize/navigation cycles;
- browser diagnostics that fail on page or console errors;
- passing built-budget verifiers and median-of-three Lighthouse results.

The one remaining motion-specific external gate is the thirty-minute
physical-device frame, temperature, battery, and memory observation. Automation
does not pretend to replace that measurement.
