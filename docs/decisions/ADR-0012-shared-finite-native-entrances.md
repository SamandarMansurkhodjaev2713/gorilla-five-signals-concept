# ADR-0012: Shared finite native entrances

Status: implementation candidate; full runtime/release gates remain required.
Date: 2026-10-25.

## Context

Three hardware CPU×4 traces attribute Material Film cold entrance to repeated
GSAP initialization: 46.5/33.1/29.7ms, nine style updates and eight layouts per
observer callback. Four `.from` groups needlessly resolve opacity/visibility and
clip presentation per target even though the stylesheet defines their rest pose.
Deferring the same work beyond the observation window would not fix this.

## Decision

Extract the already tested Reactor finite animation owner and sampled easing to
neutral motion modules. Reactor remains a small typed adapter; Material Film is
the second actual consumer, not a speculative framework. The neutral player owns
idle effect construction, one document clock, terminal completion, listeners,
cancellation and aggregated failures. It knows no feature selectors or schedule.

Material Film supplies ten explicit opacity/visibility/clip cues: copy and stage
start at 0 and end at 640ms; five calibration items start at 180+40i ms, three
crosshair items at 240+40i ms, each lasting 260ms. Full and Lite retain different
stage start clips and the same authored easing. Shared timing specifications
drive both native and GSAP backends. There is no added delay, computed-style or
geometry read in the native entrance, and no poster/video/media-controller change.

Unsupported APIs/easing or custom inline presentation select GSAP. Unexpected
native failures are diagnosed, cleaned up and fall back. The fallback owns a
nested GSAP context: stop it with `kill(false)` before exact inline restoration,
so the parent context cannot subsequently overwrite authored declarations.
Start/destroy/synchronous-completion and late-callback paths are explicitly owned.
Reduced and no-JS content remain the stylesheet baseline.

## Consequences and acceptance

Unit tests and source review cannot prove rendering smoothness. Preserve frozen
GSAP milestone evidence, compare Full/Lite on phone/desktop in all three engines,
require natural cleanup, and rerun CPU×4 attribution with the unchanged complete
2500ms observation tail. Material callback work must fit 16ms without the repeated
style/layout pattern. Other cold scenes, startup, Lighthouse and physical-device
gates remain independent; a local improvement does not authorize publication.

The existing Reactor feature easing export remains an actively used semantic
adapter to neutral math, not a second implementation. Shared-player coverage is
explicitly included so extraction cannot evade existing coverage gates.
