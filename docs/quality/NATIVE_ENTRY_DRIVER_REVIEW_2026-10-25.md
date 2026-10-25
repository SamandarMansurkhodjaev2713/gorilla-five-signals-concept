# Native entry-driver experiment — 2026-10-25

## Question and scope

Can native Web Animations playback improve the product-world entrance without
changing its choreography, materials or lifecycle? This is a private causal
experiment, not a new production engine or a release acceptance result.

The prototype changes exactly one AST-identified entry function in the served
runtime response. Code outside that function is byte-identical. Two native
animations replace the field/can entrance; real `finished` promises release
their effects before the original owned GSAP scroll callback. Actual source
poses, `translate3d`, 200/380ms phases and original transform origin remain.
The real GSAP easing functions are sampled at 256 intervals per phase; dense
checks find maximum easing errors 0.0000228/0.0000202, below 0.0001.

Both arms use decoded native can media, loaded fonts, the same material texture,
1440×900/DPR2, natural clocks, the same computed-pose observer and identical
video-recording configuration. These observations are not physical refresh-rate
measurements. Computed-style reads can flush rendering; recording adds overhead.
Inline-style mutation observers alone cannot observe native compositor poses.

## Four-case result

| Engine/driver | Active RAF samples | Median interval | Observed completion |
| --- | ---: | ---: | ---: |
| Chromium / GSAP | 18 | 33.3ms | 618.8ms |
| Chromium / native | 15 | 33.3ms | 656.8ms |
| WebKit / GSAP | 18 | 558ms | 11,056ms |
| WebKit / native | 1 | Not meaningful | 1,151ms after readiness |

The WebKit native animations report genuine finish 1,123ms after their actual
start, with only one computed intermediate pose observed. This fails the
non-vacuous motion sample requirement. Faster completion alone is insufficient:
Chromium shows no frame-pacing gain, and WebKit has not demonstrated preserved
intermediate presentation or smooth playback. Do not promote the prototype.

All four cases restore final identity geometry, retain the Original field's
left-center origin, leave zero owned native animations and report zero runtime
or network failures. Cancellation registration exists, but mid-flight abort,
navigation and preference-change behavior were not separately exercised; these
are still required before any production adoption.

The source runtime SHA-256 is
`35cb6cf321503c9d48283da44aa37645e04ca3b5f537a3731d810f7c55ba2504`.
The private response prototype begins `121f0350…`; full hashes, actual response
proof, computed poses and all four recordings remain in the ignored
`.tmp/native-entry-driver-pair/` report. No patched runtime, recording or new
media asset is published.

### Offline recording review

All four existing recordings were inspected through fixed, bounded contact
sheets; no additional browser cases were run. The VP8 recordings use fixed
25fps encoding and contain repeated frames. Encoded-frame counts and unique
compressed hashes therefore do not establish unique presented animation poses.
The recording PTS origin was not synchronized to navigation/animation time, so
the sheets cannot isolate the exact active interval without guessing. Startup,
entry and later cleanup/scroll-handoff changes coexist in the recording.

The WebKit native sheet does not reliably establish three distinct non-identity
entry poses. It does not rescue the failed computed-pose sampling gate. The
prototype is rejected for production adoption on current evidence; neither the
faster native completion nor a changing video thumbnail is a smoothness pass.
Contact sheets and offline metadata remain private in
`.tmp/native-entry-video-review/`.

The first computed native WebKit pose appears approximately 519ms after the
native start, after the authored 200ms strike phase. A future causal question is
whether preparing the actual material layers before activation changes first-
frame presentation; this is an inference, not an identified cause or approved
fix. It must preserve visible content and must not add a task-blocking loader.

## Independently adopted type boundary

`ProductWorldEntryPose` now permits only entry geometry and the two supported
origins. It excludes engine callbacks, easing and duration. Scroll configuration
continues to use its existing GSAP contract. No pose values, timing, runtime
driver or media changed. Four tests check finite geometry, origin values,
Lite displacement relative to Full, invalid identifiers and the compile-time
exclusion of engine behavior fields.

`quality:pages` passes: formatting/lint, strict diagnostics on 257 files, 181
unit tests, 47-page build, artifact/provenance/font/SBOM checks and dependency
audit. The rebuilt runtime and Original page are byte-identical to their
pre-type-change artifacts, proving no emitted application change. The Original
page SHA-256 is
`aa529be560ef4f98e4b28846c06e5cec978c2732d7579478957d93bed3366359`.

## Five review lenses

1. Correctness: preserve poses, phase durations, easing, actual finish and final
   ownership handoff. Reject the one-sample result as smoothness evidence.
2. Architecture: narrow the configuration type independently; keep the native
   driver private until benefit and cancellation are proven. No global engine
   replacement, clock override or concurrent transform owners.
3. UX/accessibility: preserve current visible defaults, Full/Lite poses and
   Reduced behavior. Do not replace the authored entrance with an endpoint jump.
4. Performance/security: compare identical artifacts and recording costs; do
   not infer FPS from completion or add a dependency. Raw diagnostic material
   remains private.
5. Maintainability/release: retain the failed hypothesis, four bounded cases and
   unapplied prototype. Current Full-motion, WebKit, Lighthouse and broader
   release gates remain open; the type-boundary pass does not supersede them.
