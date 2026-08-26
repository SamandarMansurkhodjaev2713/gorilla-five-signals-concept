import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createLicenseChoice,
  createSbomFromSources,
  parsePnpmLock,
  serializeSbom,
} from "./sbom-core.mjs";

const INTEGRITY_A = `sha512-${Buffer.alloc(64, 1).toString("base64")}`;
const INTEGRITY_B = `sha512-${Buffer.alloc(64, 2).toString("base64")}`;
const ROOT_PACKAGE = Object.freeze({
  name: "test-application",
  version: "1.0.0",
});

function createLock(records, version = "9.0") {
  const packages = records
    .map(
      ({ integrity, key }) =>
        `  '${key}':\n    resolution: {integrity: ${integrity}}`,
    )
    .join("\n\n");
  return `lockfileVersion: '${version}'\n\npackages:\n\n${packages}\n\nsnapshots:\n`;
}

function createReviewedSbom(components) {
  return {
    components: components.map(({ license, name, version }) => ({
      type: "library",
      name,
      version,
      licenses: [{ license: { name: license } }],
    })),
  };
}

test("GIVEN a lockfile and stale reviewed entry WHEN generated THEN only sorted lock resolutions remain", () => {
  const lockSource = createLock([
    { integrity: INTEGRITY_B, key: "zeta@2.0.0" },
    { integrity: INTEGRITY_A, key: "@scope/alpha@1.0.0" },
  ]);
  const reviewedSbom = createReviewedSbom([
    { license: "MIT", name: "zeta", version: "2.0.0" },
    { license: "Apache-2.0", name: "@scope/alpha", version: "1.0.0" },
    { license: "MIT", name: "removed", version: "9.0.0" },
  ]);
  const first = createSbomFromSources({
    lockSource,
    reviewedSbom,
    rootPackage: ROOT_PACKAGE,
  });
  const second = createSbomFromSources({
    lockSource: lockSource.replaceAll("\n", "\r\n"),
    reviewedSbom,
    rootPackage: ROOT_PACKAGE,
  });

  assert.deepEqual(
    first.components.map(({ name }) => name),
    ["@scope/alpha", "zeta"],
  );
  assert.equal(first.components[0].hashes[0].alg, "SHA-512");
  assert.equal(first.components[0].hashes[0].content.length, 128);
  assert.equal(serializeSbom(first), serializeSbom(second));
});

test("GIVEN reviewed SPDX data WHEN serialized THEN IDs and expressions use CycloneDX-native shapes", () => {
  assert.deepEqual(createLicenseChoice("MIT"), {
    license: { id: "MIT" },
  });
  assert.deepEqual(createLicenseChoice("Apache-2.0 AND LGPL-3.0-or-later"), {
    expression: "Apache-2.0 AND LGPL-3.0-or-later",
  });
});

test("GIVEN a new unreviewed dependency WHEN generated THEN generation fails closed", () => {
  const lockSource = createLock([
    { integrity: INTEGRITY_A, key: "unreviewed-package@1.0.0" },
  ]);
  assert.throws(
    () =>
      createSbomFromSources({
        lockSource,
        reviewedSbom: createReviewedSbom([]),
        rootPackage: ROOT_PACKAGE,
      }),
    /has no reviewed license/u,
  );
});

test("GIVEN reviewed security overrides WHEN generated THEN their installed licenses are recorded", () => {
  const sbom = createSbomFromSources({
    lockSource: createLock([
      { integrity: INTEGRITY_A, key: "brace-expansion@5.0.9" },
      { integrity: INTEGRITY_A, key: "fast-uri@3.1.5" },
      { integrity: INTEGRITY_A, key: "js-yaml@4.3.1" },
      { integrity: INTEGRITY_A, key: "nanoid@3.3.18" },
    ]),
    reviewedSbom: createReviewedSbom([]),
    rootPackage: ROOT_PACKAGE,
  });

  assert.deepEqual(
    sbom.components.map(({ licenses, name }) => ({ licenses, name })),
    [
      { licenses: [{ license: { id: "MIT" } }], name: "brace-expansion" },
      {
        licenses: [{ license: { id: "BSD-3-Clause" } }],
        name: "fast-uri",
      },
      { licenses: [{ license: { id: "MIT" } }], name: "js-yaml" },
      { licenses: [{ license: { id: "MIT" } }], name: "nanoid" },
    ],
  );
});

test("GIVEN an unapproved declared license WHEN generated THEN policy rejects it", () => {
  const lockSource = createLock([
    { integrity: INTEGRITY_A, key: "unsafe-package@1.0.0" },
  ]);
  assert.throws(
    () =>
      createSbomFromSources({
        lockSource,
        reviewedSbom: createReviewedSbom([
          {
            license: "UNKNOWN",
            name: "unsafe-package",
            version: "1.0.0",
          },
        ]),
        rootPackage: ROOT_PACKAGE,
      }),
    /unreviewed or missing license/u,
  );
});

test("GIVEN malformed or unsupported lock data WHEN parsed THEN parsing fails closed", () => {
  assert.throws(
    () =>
      parsePnpmLock(
        createLock([{ integrity: INTEGRITY_A, key: "valid@1.0.0" }], "8.0"),
      ),
    /Unsupported pnpm lockfile version/u,
  );
  assert.throws(
    () =>
      parsePnpmLock(
        "lockfileVersion: '9.0'\n\npackages:\n\n  broken@1.0.0:\n\nsnapshots:\n",
      ),
    /has no SHA-512 integrity/u,
  );
});
