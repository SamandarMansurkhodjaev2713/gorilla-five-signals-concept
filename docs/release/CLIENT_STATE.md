# Technical client-state inventory

## One-use reload position

- Key: `gorilla:reload-scroll:v1` in same-origin, per-tab `sessionStorage`.
- Purpose: preserve the underlying document position through a native reload,
  including when an open menu temporarily locks the background viewport.
- Payload: pathname and finite nonnegative numeric position only. No origin,
  query, fragment, identifier, product content or telemetry is included.
- Write: nonpersisted pagehide. Open-menu capture uses its already-preserved
  underlying position, rather than the locked viewport.
- Read: the next execution of the site's lifecycle module removes the record
  before parsing. Only same-path Navigation Timing `reload` may use it.
  Other navigation types and paths discard it. Browser-managed session lifetime
  applies if the site is not initialized again.
- Validation: maximum 2,048 characters; valid JSON object, matching pathname and
  finite nonnegative coordinate. Malformed input returns a typed rejection;
  unexpected parser errors remain observable. Zero is a valid position.
- Failure: structured lifecycle diagnostic plus existing history fallback.
  Diagnostics do not include the stored payload, query or path.
- Network: no transmission, cookie, endpoint, analytics service or dependency.

This is an implementation inventory, not legal advice or release approval.
Legal/privacy review remains part of the documented production release process.
Existing age-confirmation and motion-preference state are unchanged by this key.
