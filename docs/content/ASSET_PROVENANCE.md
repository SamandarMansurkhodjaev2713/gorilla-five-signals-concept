# Asset provenance ledger

- Version: 1.2
- Updated: 2026-08-26
- Market/territory: Uzbekistan
- Rights statement: the user confirmed on 2026-07-26 that written permissions
  are obtained and legal evidence is managed externally.
- Public-release statement: the project owner explicitly authorized a public
  GitHub repository and GitHub Pages publication on 2026-08-26. This approval
  is recorded as `PERM-PUBLIC-2026-08-26` and does not transfer third-party
  trademark or asset rights to repository users.

User confirmation is recorded as `PERM-USER-2026-07-26`. It authorizes the team
to continue, but a production file is still incomplete until its source,
checksum, transformation history, alt/decorative state, and applicable
likeness/expiry metadata are recorded here.

## Allowed status transitions

```text
requested → received → verified → derivatives-built → release-approved
                   ↘ rejected
```

No asset may be referenced from production code before `verified`. No deployable
derivative may ship before `release-approved`.

## Current production inventory

Six official-site files are now present in `src/assets/brand`. Their local
SHA-256 values exactly match the current HTTPS source bytes listed below. This
proves source integrity, not packaging freshness; back/bottom package evidence
is still required for regulated facts.

| Asset ID                 | Local file                               | Source URL                                                                | Dimensions |   Bytes | SHA-256                                                            | Permission           | Status     |
| ------------------------ | ---------------------------------------- | ------------------------------------------------------------------------- | ---------: | ------: | ------------------------------------------------------------------ | -------------------- | ---------- |
| MEDIA-BRAND-LOGO-PRIMARY | `src/assets/brand/gorilla-logo.png`      | <https://www.gorillaenergy.uz/img/fixed_menu_logo.54f2b2dd.png>           |  1500×1210 |  36,806 | `7149e5cfb14a6e72ece2f19c37397277ef4b982d2be6934f73198f80d9af121d` | PERM-USER-2026-07-26 | `verified` |
| MEDIA-CAN-ORIGINAL-FRONT | `src/assets/brand/can-original.png`      | <https://www.gorillaenergy.uz/img/products_big_can_original.f05e880b.png> |   759×1976 | 302,219 | `f1ac0a88c300d739aeca2783b83c12e5f23484ac908226defaddeb73b40f8400` | PERM-USER-2026-07-26 | `verified` |
| MEDIA-CAN-ZERO-FRONT     | `src/assets/brand/can-zero.png`          | <https://www.gorillaenergy.uz/img/products_big_can_sugar.39048f88.png>    |   768×1975 | 377,237 | `20375992a68b8ccfb05851a85fe6dd6c653e990194a1d5dfd43b564f7bc7ce46` | PERM-USER-2026-07-26 | `verified` |
| MEDIA-CAN-EXTRA-FRONT    | `src/assets/brand/can-extra.png`         | <https://www.gorillaenergy.uz/img/products_big_can_extra.a7450f28.png>    |   754×1973 | 353,215 | `30fc237c3085d391067bb0713dcef884e1ffe8afb68cca58530d70bb769aace8` | PERM-USER-2026-07-26 | `verified` |
| MEDIA-CAN-MANGO-FRONT    | `src/assets/brand/can-mango-coconut.png` | <https://www.gorillaenergy.uz/img/products_big_can_mango.40f22711.png>    |   754×1973 | 356,333 | `a80de099fe6ca47ac135283c9ab215cddbdd895251eca0f3978b89eb90170cd9` | PERM-USER-2026-07-26 | `verified` |
| MEDIA-CAN-LYCHEE-FRONT   | `src/assets/brand/can-lychee-pear.png`   | <https://www.gorillaenergy.uz/img/products_big_can_lychee.21654ae1.png>   |   758×1973 | 374,865 | `9039d2a9b50f45b91446c47f8980b3b8b3cda8b08a4b4158c4d5f5f94ac2342f` | PERM-USER-2026-07-26 | `verified` |

All six files are 32-bit PNGs with alpha. Production must create optimized
AVIF/WebP/fallback derivatives rather than sending these source PNGs directly
as the initial mobile payload.

## Release-registered generated derivatives

The deployable tree does not serve the source PNGs above as product media.
`scripts/build-brand-assets.mjs` emits WebP masters plus 320/480 product
variants and 96/192 logo variants under `public/media/generated/`. Eight
machine-readable records in `src/content/media/` bind every shipped path to its
SHA-256 checksum, localized alternative text, owner, license, permission
reference, source URL where applicable, and derivative list.

All generated files are `release-approved` for this public portfolio concept
under `PERM-USER-2026-07-26` and `PERM-PUBLIC-2026-08-26`.
`scripts/verify-provenance.mjs` fails if a
registered checksum changes, a required record field is absent, a right is
expired, or any generated file has no ledger record.

The material-film record also captures its canonical build toolchain:
`ffmpeg-static@5.3.0`, FFmpeg `6.1.1-essentials_build-www.gyan.dev`, canonical
host `win32-x64`, and executable SHA-256
`04e1307997530f9cf2fe35cba2ca7e8875ca91da02f89d6c7243df819c94ad00`.
The generator verifies that hash before spawning FFmpeg; the binary is a
build-only GPL-3.0-or-later dependency and is not copied to the deployed site.

| Asset ID           | Planned role                       | Kind        | Origin                                              | Permission             | Current status     | Required evidence                                                                                                          |
| ------------------ | ---------------------------------- | ----------- | --------------------------------------------------- | ---------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| MEDIA-HERO-DESKTOP | Hero material film, 16:9           | video       | Original production                                 | Project-owned          | `requested`        | Shot log, model/property releases, audio status, master checksum                                                           |
| MEDIA-HERO-MOBILE  | Hero material film, 9:16           | video       | Original production                                 | Project-owned          | `requested`        | Shot log, model/property releases, audio status, master checksum                                                           |
| MEDIA-PRODUCT-FILM | Below-fold product material film   | video       | Project-generated from release-registered packshots | PERM-USER-2026-07-26   | `release-approved` | `material-film.json`, derivative checksums, verified FFmpeg toolchain; silent film contains no people or dialogue          |
| MEDIA-CULTURE-01   | Adult Uzbekistan culture editorial | image/video | Commissioned local production                       | Project-owned/licensed | `requested`        | Creator agreement, subject consent, territory/duration                                                                     |
| FONT-DISPLAY-01    | Oswald variable display subsets    | WOFF2       | `@fontsource-variable/oswald@5.3.0` / OFL-1.1       | OFL-1.1                | `release-approved` | Package-pinned source, checksums, generated manifest, and shipped license below; rendered glyph proof remains in visual QA |
| FONT-TEXT-01       | Onest variable text subsets        | WOFF2       | `@fontsource-variable/onest@5.3.0` / OFL-1.1        | OFL-1.1                | `release-approved` | Package-pinned source, checksums, generated manifest, and shipped license below; rendered glyph proof remains in visual QA |

## Release-registered font artifacts

`scripts/build-fonts.py` copies the deployable WOFF2 files and exact OFL notices
from the two package versions pinned in `devDependencies`. It also writes a
deterministic manifest. No ignored source directory or network request is
required. The decision and measured locale budget are recorded in ADR-0005.

| Path                                                 |                       Bytes | SHA-256                                                            |
| ---------------------------------------------------- | --------------------------: | ------------------------------------------------------------------ |
| `public/fonts/oswald/oswald-latin-variable.woff2`    |                      28,488 | `bd73278ee0c50041b91b4c03d1229e35b501637f46b6409e7da2d3a758446ea5` |
| `public/fonts/oswald/oswald-cyrillic-variable.woff2` |                      15,688 | `9307b75d3508236a0bae4f29ee3d2ce9aee545120ec9ef29e2cd1187bf6b0e5b` |
| `public/fonts/onest/onest-latin-variable.woff2`      |                      32,236 | `67849bcc11e02177442da14ad954bfe1cc709553dad137b5003449b303e83fc3` |
| `public/fonts/onest/onest-cyrillic-variable.woff2`   |                      14,228 | `37bc16874135c16134679b1db25b87fe80eb9fcd4ef3666af7c531bfde204fe2` |
| `public/fonts/licenses/Oswald-OFL.txt`               |                       4,388 | `23916cdee678823c3c517c699cb2e043088de0d46c959eeaa168b54bb84534df` |
| `public/fonts/licenses/Onest-OFL.txt`                |                       4,378 | `a2a09da98a3d0d1ec79fc2d6deeac748b20a8153e26699552e7b59b5a40b63a3` |
| `public/fonts/font-manifest.json`                    | generated deterministically | `eef6adbd5d5886efb7e15a0cdf1b8b6bfe076f044fc26b5fe6a36467c21797ac` |

## Original social artwork

| Asset ID                  | Local file      | Dimensions |     Bytes | SHA-256                                                            | Origin                                                                                                                                    | Status             |
| ------------------------- | --------------- | ---------: | --------: | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| MEDIA-SOCIAL-FIVE-SIGNALS | `public/og.png` |   1732×908 | 1,901,995 | `64aad09947176381be3a226f318afc6f95431a0fce10f604bdfe1b483804e476` | One built-in OpenAI image-generation request on 2026-07-27; original abstract industrial artwork, no trademark, product, person, or claim | `release-approved` |

## Original material environment

| Asset ID                              | Local file                                                                    | Dimensions |   Bytes | SHA-256                                                            | Origin                                                                                                                                                                                                             | Status              |
| ------------------------------------- | ----------------------------------------------------------------------------- | ---------: | ------: | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| MEDIA-TASHKENT-AFTERDARK-MATERIAL-V1  | `public/media/generated/material/tashkent-afterdark-material-v1.webp`         |   1672×941 | 250,948 | `2d4291e55aec9c88fc274307317205060ebcc6739f4e2041d8d63ddf02e5c3cb` | One built-in OpenAI image-generation request on 2026-08-11; original decorative aluminum, condensation, ice, asphalt, and light plate with no trademark, packaging, person, claim, text, or copied reference asset | `release-approved` |
| MEDIA-MATERIAL-FILM-AFTERDARK-POSTERS | `public/media/generated/material/material-film-afterdark-desktop-poster.webp` |   1280×720 | 164,994 | `f5940e9bb8af00521a619ec24c40e6272e1298b53b92180315dcf173418e7179` | Deterministic Sharp screen composite of the registered material plate and release-registered product-film poster; three responsive derivatives are recorded in the media ledger                                    | `release-approved` |

The AVIF material derivative and four responsive composite posters are
registered in `src/content/media/tashkent-afterdark-material.json` and
`src/content/media/material-film-afterdark-posters.json`. The source PNG is
retained outside the deployed directory at
`media-source/generated/tashkent-afterdark-material-v1.png`. Release approval
was granted after checksum verification, full-size rendered-frame inspection,
brand-boundary review, and the explicit public-promotion authorization recorded
as `PERM-PUBLIC-2026-08-26`.

## Research-only official web assets

The current official site exposes product PNGs and hero media. Their URLs are
recorded only to make research reproducible. They are not production assets, are
not downloaded into Git, and are not automatically approved merely because the
URL is public.

| Research ID        | Observed URL                                                              | Role                                | Status          |
| ------------------ | ------------------------------------------------------------------------- | ----------------------------------- | --------------- |
| REF-CAN-ORIGINAL   | <https://www.gorillaenergy.uz/img/products_big_can_original.f05e880b.png> | Current-site Original can candidate | `research-only` |
| REF-CAN-ZERO       | <https://www.gorillaenergy.uz/img/products_big_can_sugar.39048f88.png>    | Current-site ZERO can candidate     | `research-only` |
| REF-CAN-EXTRA      | <https://www.gorillaenergy.uz/img/products_big_can_extra.a7450f28.png>    | Current-site EXTRA can candidate    | `research-only` |
| REF-CAN-MANGO      | <https://www.gorillaenergy.uz/img/products_big_can_mango.40f22711.png>    | Current-site Mango can candidate    | `research-only` |
| REF-CAN-LYCHEE     | <https://www.gorillaenergy.uz/img/products_big_can_lychee.21654ae1.png>   | Current-site Lychee can candidate   | `research-only` |
| REF-HERO-UZ        | <https://www.gorillaenergy.uz/media/header-uz.8097cb3f.mp4>               | Current-site desktop hero video     | `research-only` |
| REF-HERO-UZ-MOBILE | <https://www.gorillaenergy.uz/media/header-mobile-uz.1c25bb11.mp4>        | Current-site mobile hero video      | `research-only` |

The mapping above was observed in the current official application bundle. It
must be checked visually against current Uzbekistan packaging before being used
as package evidence.

## Record required for every received file

```yaml
id: MEDIA-...
sourceFile: private path outside deployable source
owner: legal person or company
creator: credited creator
sourceUrl: optional canonical origin
permissionEvidence: external agreement reference
license: exact grant or project-owned
territories: [UZ]
rightsStartsAt: YYYY-MM-DD
rightsExpiresAt: YYYY-MM-DD | null
peopleConsent: agreement reference | null
minorsPresent: false
consumptionShown: false
sha256: 64 lowercase hex characters
colorProfile: sRGB | Display-P3
alt:
  uz: localized meaningful alternative
  ru: localized meaningful alternative
  en: localized meaningful alternative
decorative: true | false
derivatives:
  - path: public/media/generated/...
    sha256: ...
    codec: ...
    width: ...
    height: ...
    bytes: ...
reviewedBy: ...
reviewedAt: YYYY-MM-DD
status: verified | derivatives-built | release-approved | rejected
```

`alt` must be `null` when `decorative: true`; otherwise all enabled locales are
required. A model/creator release is not inferred from a photographer license.
