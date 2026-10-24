# Lighthouse diagnosis — 2026-10-25

## Fresh public-path baseline, not release acceptance

Lighthouse 13.5.0, installed Chrome 155, simulated CPU ×4, three runs per route.
No threshold was rounded, relaxed or replaced. Public-readiness homepage HTML
SHA-256: `51d903e478034339e0f8e67d7dbfaf5fcd8b71270d326953e2922bffb6b8e8ef`.

| Route | Performance / other categories | Median LCP | CLS | Median TBT |
| --- | --- | ---: | ---: | ---: |
| UZ homepage | 97 / 100 / 100 / 100 | 2501.432ms | 0 | 89.5ms |
| UZ Original | 99 / 100 / 100 / 100 | 2184.105ms | 0 | 0ms |
| UZ locator | 99 / 100 / 100 / 100 | 1890.051ms | 0 | 0ms |

The command failed because homepage LCP exceeded 2500ms. The older October 14
reports were preserved privately before the fresh run replaced generated output.

## Responsive preload trial: removed without a proven benefit

The homepage-only trial bound a native image preload and rendered hero to one
SSR media factory and the existing responsive size policy. It did not alter
the image bytes, dimensions, visual composition, motion or application script.
Five factory tests and nine fresh native no-script preload cases passed across
Chromium, Firefox and WebKit, including matching attributes and one request for
the selected primary-image URL. These contracts are not a performance claim.

The initial Firefox no-script test incorrectly awaited a page-side `decode()`
promise. A minimal same-image fixture reproduced a suspended promise only with
scripts disabled, while native complete/dimension metadata was valid in both
contexts. The portable network contract now polls that metadata outside a
page-side promise. Scripts were not enabled to manufacture a no-script pass.

The subsequent public-path trial batch **failed**: homepage performance 77,
LCP 2576.829ms and TBT 347.586ms; Original performance 63 and TBT 6927.273ms;
locator performance 67 and TBT 2098.322ms. CLS and other category scores stayed
0 and 100 respectively. No performance benefit or release approval is inferred.

Both batches had identical Lighthouse settings and browser version. Original
and locator had identical script filenames, request counts and transferred
bytes, without loading/console errors or Lighthouse warnings. The large TBT
increase was dominated by isolated `Other / Unattributable` tasks, not increased
script evaluation. The reports alone cannot identify the native operation or
establish host contention, preload causation, or a fix. Those failed reports
were preserved privately; they must not be discarded after a later green run.

## Trace evidence and next diagnostic boundary

One saved-trace diagnostic on the local dev-base Original route did not reproduce
the multi-second task: TBT was 0; the largest real tasks were 54.469ms and
54.093ms, dominated by style/layout work. Its exact served HTML was verified.
This dev-base result is not a canonical public-path median or release pass.

The canonical runner now retains every run's trace and DevTools log using the
existing Lighthouse `--save-assets` option. Traces stay in ignored local output;
they are not production telemetry or public artifacts. The next canonical run
was diagnostic: identify the unexplained native task, not rerun until green.

That canonical batch also failed: homepage 73 / LCP 2496.527ms / TBT 1224.737ms;
Original 70 / TBT 1605.796ms / CLS .090744; locator 79 / TBT 876.261ms /
CLS .040016. Its public homepage digest is
`3e3a57a47d2fb8cf72c657a909c4d916e50400cfb8fba243cfbb4488bbc20601`.
Nine traces and nine DevTools logs were retained. The five-millisecond homepage
LCP difference from baseline is not a robust benefit, while total performance
remains unacceptable. The original image already satisfied native eager/high-
priority/discovery checks before the trial. The hint, its temporary factory
and tests were removed from working source; private source snapshots remain
available alongside the failed evidence. Nothing from that trial was promoted.

The actual failing canonical traces matched dominant tasks to CrRendererMain.
Product median had an opaque 416.907ms RunTask with no nested instrumented child
events, overlapping 386.205ms of compositor work; the worst product task was
1886.769ms, overlapping 1786.630ms of compositor work. A locator task lasted
1329.699ms with 1264.614ms of overlapping compositor work. Native GPU tasks also
overlapped, but some carried another renderer PID. This proves timing
correlation with composition/presentation, not a specific causal GPU operation
or host fault. It does not justify blaming new JavaScript, disabling graphics,
loosening budgets or treating the dev-base non-reproduction as acceptance.

After removal, the normal 47-route build passed and the homepage/product HTML
digests returned to `f12589bdf854662c7a905b39581713faded152fd82911aa76ffb48938791c092`
and `e06803a678f7eb0824973b87649762c7593ac4251cc3e4d2a1f6e5d365b3b3cf`.
The application source is the reviewed `b06353d` state; only diagnostic runner
and documentation changes remain beyond it. This is not a performance pass.

Five review lenses: preserve raw failures and hash/settings evidence; retain
owned browser/profile cleanup; keep responsive/no-script image semantics and
unchanged product truth; retain all original budgets without claiming a host
cause; document and privately preserve the trace needed to explain a failure.
WebKit active-motion failure and the broader release checklist remain open.
