# Awwwards gap review — 2026-08-25

## Verdict

The current build has several strong poster frames, but it is not yet a
continuous awards-level experience. The main gap is direction, not effect
count: the page often behaves like an editorial dashboard with many competing
controls instead of a product-led spatial film.

This review compares the live local build at 1280×720 with the supplied motion
reference and the approved Five Frequencies plan. Static full-page captures are
not accepted as sole evidence because sticky and deferred scenes can be
misrepresented by screenshot stitching.

## Five critique rounds

### Round 1 — spectacle

- Draft: add more scroll reveals, parallax, and hover effects.
- Critique: the page already has many effects; another layer would increase
  visual noise and make the result feel generated.
- Improvement: remove repeated reveals and reserve motion for changes in
  state, material, scale, or spatial hierarchy.

### Round 2 — composition

- Draft: simplify every section.
- Critique: simplification without a dominant object would create empty poster
  templates.
- Improvement: enforce one thought and one dominant product object per
  viewport while moving controls to the frame edge.

### Round 3 — product continuity

- Draft: enlarge every can.
- Critique: five unrelated large packshots would still read as a catalog.
- Improvement: preserve one can/signal as the memory device and transform its
  material, trajectory, typography, and frequency between chapters.

### Round 4 — interface chrome

- Draft: hide navigation and controls completely.
- Critique: hidden navigation harms orientation, keyboard access, and product
  choice.
- Improvement: use compact persistent chrome with an explicit menu, motion
  preference, and edge-aligned product controls.

### Round 5 — mobile

- Draft: scale the desktop film down.
- Critique: desktop density, pinned scenes, and diagonal typography become
  illegible and excessively long on a phone.
- Improvement: author a separate mobile composition with one product at a
  time, thumb-reachable controls, shorter transitions, and poster-first media.

## Priority gap matrix

### P0 — prevents an awards-level result

1. **No continuous spatial story.** Chapters are visually styled but the can
   does not convincingly travel from hero to manifesto, reactor, material, and
   terminal. Implement shared signal handoffs and scene-to-scene color/mask
   continuity.
2. **Too much interface per frame.** Headline, chapter code, selector rail,
   previous/next controls, progress, CTA, copy panel, and decorative data often
   compete simultaneously. Keep one primary action and move secondary controls
   to the perimeter.
3. **Sticky scenes can sit underneath the header.** Pinning must use the actual
   header height and preserve a complete readable composition at every scroll
   position.
4. **Motion begins as generic entrance animation.** Replace independent fades
   with a finite Signal Boot, can lock, frequency split, material cut, and
   coordinate trace.
5. **Desktop and mobile are not yet separate enough.** Validate at 360×800,
   390×844, and phone landscape; never accept a desktop composition merely
   wrapped into one column.
6. **The lower journey loses the product.** FAQ/contact/locator are well styled
   but feel like a system interface. Carry packshot color, material, and signal
   geometry through the terminal so the product remains present.

### P1 — quality and distinctiveness

1. Reduce the persistent header from conventional full navigation to a compact
   signal bar with an explicit full-screen menu.
2. Increase product scale inside the Flavor Reactor and reduce the perceived
   size of its console.
3. Give the manifesto one transmitted pulse instead of separate line reveals.
4. Replace repeated boxed panels with masks, overlaps, and open compositions.
5. Add a quiet reading beat between the reactor and material film so high
   pressure scenes do not flatten into one constant intensity.
6. Make the Material Film controls visually subordinate to the material image.
7. Use Tashkent-specific night texture and spatial rhythm without turning the
   site into cyberpunk decoration.

### P2 — final polish

1. Refine cursor and magnetic affordances only for fine pointers.
2. Add route transitions that preserve the selected can without delaying real
   navigation.
3. Tune word wrapping per locale instead of forcing identical line breaks.
4. Calibrate grain, scan lines, and glow per display density.
5. Add optional, user-controlled sound only if provenance, mute state, and
   performance gates remain satisfied.

## Acceptance evidence

- Viewport screenshots at each chapter boundary, not only a stitched page.
- Recorded scroll at desktop and mobile showing uninterrupted chapter handoff.
- Keyboard, touch, rapid selection, reduced-motion, and no-JavaScript checks.
- No occluded headings, horizontal overflow, unreadable copy, or empty reveal
  state at any required viewport.
- Current format, lint, typecheck, unit, E2E, accessibility, visual,
  performance, build, provenance, audit, and Sites verification on frozen
  source.
