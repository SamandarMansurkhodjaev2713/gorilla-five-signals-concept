# Public GitHub configuration

Verified: 2026-10-14. This records repository configuration, not commercial
release approval or a claim that every application gate passes.

## Repository and publication

- Public repository: `SamandarMansurkhodjaev2713/gorilla-five-signals-concept`.
- Default branch: `main`.
- GitHub Pages: official Actions deployment; HTTPS enforcement enabled.
- Live URL: <https://samandarmansurkhodjaev2713.github.io/gorilla-five-signals-concept/>.
- Description and topics identify an independent portfolio concept.
- Issues enabled; wiki disabled; contribution and security instructions committed.
- Original source is All Rights Reserved, with separate brand/dependency/font
  ownership and provenance notices. Public visibility is not an open-source grant.

## Protection of main

The branch-protection API was read before the update and returned an unprotected
branch. The update succeeded and its response confirmed the following settings:

| Setting | Enforced state |
| --- | --- |
| Pull request required | Yes |
| Branch up to date before merge | Yes |
| Required source check | `Source quality gates`, GitHub Actions app 15368 |
| Required analysis check | `Analyze JavaScript and TypeScript`, GitHub Actions app 15368 |
| Required CodeQL result | `CodeQL`, GitHub Code Scanning app 57789 |
| Administrator bypass | Disabled |
| Force push / branch deletion | Disabled / disabled |
| Linear main history | Required; squash or rebase promotion |
| Unresolved review conversations | Must be resolved |
| Minimum approving reviews | Zero; the repository currently has one maintainer |

App identities were taken from actual successful check runs, not guessed.
The pull-request requirement does not imply an independent human approval.
Browser, responsive, visual, accessibility, performance, asset, and legal release
approval remain separate documented gates. A draft PR is not ready for promotion.

Future check-name or workflow changes must update the branch requirements in the
same maintenance operation; otherwise a required status can remain pending.
Do not bypass protection to deploy an unverified artifact.

## Security settings and remaining advisories

Repository API evidence confirms Dependabot security updates, secret scanning,
and push protection are enabled. Private vulnerability reporting was enabled
and verified separately. No credential or private approval evidence is committed.

At this verification point, the default branch still has 20 open Dependabot
alerts: two critical, eleven high, and seven medium. A separately isolated
maintenance candidate has a clean complete dependency audit; that is not proof
that `main` has been repaired. Record candidate verification, merge/deployment,
and refreshed default-branch advisory state before marking the alerts resolved.

## Read-only verification

```bash
gh repo view SamandarMansurkhodjaev2713/gorilla-five-signals-concept \
  --json visibility,defaultBranchRef,homepageUrl
gh api repos/SamandarMansurkhodjaev2713/gorilla-five-signals-concept/pages
gh api repos/SamandarMansurkhodjaev2713/gorilla-five-signals-concept/branches/main/protection
```

Keep GitHub Pages response-header limitations separate from the Cloudflare/Sites
adapter contract. A successful Pages workflow proves deployment, not all browser
or performance requirements.

## Five review lenses

1. Correctness: real check names and app IDs are verified; strict status checking
   requires the branch to contain current main changes.
2. Architecture: repository controls protect promotion without changing UI,
   motion ownership, or the deployment artifact.
3. UX: release review remains required; source CI alone cannot certify the site.
4. Security: force-push/deletion and administrator bypass are disabled; existing
   default-branch dependency advisories remain explicitly open.
5. Maintenance: zero required approvals avoids a one-maintainer deadlock while
   still requiring PRs and checks; configuration and limitations are documented.
