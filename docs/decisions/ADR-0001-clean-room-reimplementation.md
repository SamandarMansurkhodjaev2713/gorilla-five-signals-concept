# ADR-0001: Clean-room reimplementation

- Status: accepted
- Date: 2026-07-26

## Context

The reference repository is a clone of a branded commercial experience, has no formal license file, and includes third-party identity, copy, code, images, and videos. The portfolio project must be original and safe to publish.

## Decision

Treat the local clone as read-only behavioral research.

- Keep it only in `_reference/`, excluded from Git.
- Do not copy source or assets.
- Record abstract observations in audit documents.
- Design product, information architecture, composition, typography, motion grammar, and implementation independently.
- Require provenance for every production asset.

## Consequences

Positive:

- the final portfolio piece has a defensible authorship story;
- architecture is designed around our product rather than inherited constraints;
- the result can diverge far enough to be creatively valuable.

Cost:

- implementation takes longer than reskinning;
- every scene and asset requires new design work.

This cost is intentional and accepted.
