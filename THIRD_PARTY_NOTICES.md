# Third-party notices

- Oswald is distributed under the SIL Open Font License 1.1. The complete
  notice ships at `public/fonts/licenses/Oswald-OFL.txt`.
- Onest is distributed under the SIL Open Font License 1.1. The complete notice
  ships at `public/fonts/licenses/Onest-OFL.txt`.
- JavaScript and build dependencies retain the licenses declared by their
  packages. The reviewed CycloneDX inventory is
  `docs/release/SBOM.cdx.json`.
- GSAP is used under GreenSock's Standard “no charge” license. Deployers must
  re-check the applicable terms if the product or distribution model changes.
- `ffmpeg-static@5.3.0` is a build-only development dependency distributed
  under `GPL-3.0-or-later`. Its executable is used to generate project-owned
  video derivatives and is not copied into the deployed site artifact. The film
  builder verifies the approved platform binary before execution.
- Official Gorilla product imagery and logo remain governed by the permission
  basis recorded in `docs/content/ASSET_PROVENANCE.md`.

The SBOM verifier rejects missing or unapproved dependency licenses. The legacy
`parse-cache-control@1.0.1` package declares “BSD” in a deprecated plural field;
its shipped three-clause license text was reviewed and is recorded as
`BSD-3-Clause`.
