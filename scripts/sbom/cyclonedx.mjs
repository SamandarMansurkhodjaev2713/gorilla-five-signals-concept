import {
  createLicenseChoice,
  reviewedLicenseValue,
} from "./license-policy.mjs";
import { compareCodePoints, isRecord, readString } from "./shared.mjs";

const SHA_512_HEX_PATTERN = /^[a-f0-9]{128}$/u;

function packageUrl(name, version) {
  if (!name.startsWith("@")) {
    return `pkg:npm/${name}@${version}`;
  }
  const [scope, packageName] = name.slice(1).split("/");
  if (scope === undefined || packageName === undefined) {
    throw new Error(`Invalid scoped package name: ${name}`);
  }
  return `pkg:npm/%40${scope}/${packageName}@${version}`;
}

export function createComponent(packageRecord, license) {
  const purl = packageUrl(packageRecord.name, packageRecord.version);
  return {
    type: "library",
    "bom-ref": purl,
    name: packageRecord.name,
    version: packageRecord.version,
    hashes: [
      {
        alg: "SHA-512",
        content: packageRecord.integrityHex,
      },
    ],
    licenses: [createLicenseChoice(license)],
    purl,
  };
}

function componentIdentity(component) {
  const name = readString(component.name, "Component name");
  const version = readString(component.version, `${name} version`);
  const key = `${name}@${version}`;
  const expectedPurl = packageUrl(name, version);
  if (
    component.type !== "library" ||
    component.purl !== expectedPurl ||
    component["bom-ref"] !== expectedPurl
  ) {
    throw new Error(`${key} has an invalid CycloneDX identity.`);
  }
  return key;
}

function validateIntegrity(component, key) {
  const hashes = component.hashes;
  if (
    !Array.isArray(hashes) ||
    hashes.length !== 1 ||
    !isRecord(hashes[0]) ||
    hashes[0].alg !== "SHA-512" ||
    typeof hashes[0].content !== "string" ||
    !SHA_512_HEX_PATTERN.test(hashes[0].content)
  ) {
    throw new Error(`${key} has an invalid lockfile integrity hash.`);
  }
}

function validateComponent(component, previousKey) {
  if (!isRecord(component)) {
    throw new Error("The generated SBOM contains an invalid component.");
  }
  const key = componentIdentity(component);
  validateIntegrity(component, key);
  if (!Array.isArray(component.licenses) || component.licenses.length !== 1) {
    throw new Error(`${key} must have exactly one license choice.`);
  }
  reviewedLicenseValue(component.licenses[0], key);
  if (previousKey !== undefined && compareCodePoints(previousKey, key) >= 0) {
    throw new Error(`SBOM components are duplicated or unsorted at ${key}.`);
  }
  return key;
}

function validateDocumentShape(sbom) {
  if (
    !isRecord(sbom) ||
    sbom.bomFormat !== "CycloneDX" ||
    sbom.specVersion !== "1.6" ||
    sbom.version !== 1 ||
    !isRecord(sbom.metadata) ||
    !isRecord(sbom.metadata.component) ||
    !Array.isArray(sbom.metadata.properties) ||
    !Array.isArray(sbom.components) ||
    sbom.components.length === 0
  ) {
    throw new Error("The generated CycloneDX document shape is invalid.");
  }
}

function validateLockBinding(sbom, expectedLockfileSha256) {
  const lockProperty = sbom.metadata.properties.find(
    (property) =>
      isRecord(property) && property.name === "gorilla:build:pnpm-lock-sha256",
  );
  if (
    !isRecord(lockProperty) ||
    lockProperty.value !== expectedLockfileSha256
  ) {
    throw new Error("The SBOM is not bound to the current pnpm lockfile.");
  }
}

export function validateSbom(sbom, expectedLockfileSha256) {
  validateDocumentShape(sbom);
  validateLockBinding(sbom, expectedLockfileSha256);
  let previousKey;
  for (const component of sbom.components) {
    previousKey = validateComponent(component, previousKey);
  }
  return sbom;
}
