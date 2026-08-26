# Documentation map

- `product/` — product strategy, creative direction, and master plan.
- `architecture/` — target structure and runtime boundaries.
- `decisions/` — architectural decision records.
- `content/` — localized copy, claims, sources, locator policy, and provenance.
- `design/` — design system and desktop/mobile storyboards.
- `motion/` — choreography, scene contracts, and lifecycle review.
- `quality/` — engineering standard, test strategy, current evidence, and
  critique records.
- `release/` — approvals, SBOM, checklist, deployment, and rollback.
- `execution/` — milestone evidence board.
- `audit/` — local generated evidence; large machine reports are ignored by
  Git.

Start with:

1. [Master implementation plan](product/GORILLA_MASTER_PLAN.md)
2. [Product and creative direction](product/GORILLA_CONCEPT.md)
3. [Target architecture](architecture/TARGET_ARCHITECTURE.md)
4. [Current QA status](quality/QA_STATUS.md)
5. [Historical five-pass review](quality/RELEASE_REVIEW_2026-08-10.md)
6. [Release checklist](release/RELEASE_CHECKLIST.md)
7. [Release and rollback runbook](release/RELEASE_RUNBOOK.md)

Generated reports belong in `docs/audit/evidence/` or `test-results/`. Durable
conclusions are summarized in tracked documents without copying third-party
source or private legal material.
