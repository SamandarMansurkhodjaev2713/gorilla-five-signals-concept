import { isRecord, readString } from "./shared.mjs";

const CUSTOM_GSAP_LICENSE =
  "Standard 'no charge' license: https://gsap.com/standard-license.";
const SPDX_LICENSE_IDS = new Set([
  "0BSD",
  "Apache-2.0",
  "BlueOak-1.0.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "CC0-1.0",
  "ISC",
  "LGPL-3.0-or-later",
  "MIT",
  "MPL-2.0",
  "OFL-1.1",
  "Python-2.0",
  "GPL-3.0-or-later",
]);
const REVIEWED_SPDX_EXPRESSIONS = new Set([
  "(MIT OR CC0-1.0)",
  "Apache-2.0 AND LGPL-3.0-or-later",
  "Apache-2.0 AND LGPL-3.0-or-later AND MIT",
]);
const REVIEWED_LICENSE_VALUES = new Set([
  ...SPDX_LICENSE_IDS,
  ...REVIEWED_SPDX_EXPRESSIONS,
  CUSTOM_GSAP_LICENSE,
]);
const BOOTSTRAP_LICENSE_RULES = Object.freeze([
  [
    "MIT",
    /^(?:@derhuerst\/http-basic@8\.2\.4|@types\/node@10\.17\.60|agent-base@6\.0\.2|buffer-from@1\.1\.2|concat-stream@2\.0\.0|env-paths@2\.2\.1|http-response-object@3\.0\.2|https-proxy-agent@5\.0\.1|progress@2\.0\.3|readable-stream@3\.6\.2|safe-buffer@5\.2\.1|string_decoder@1\.3\.0|typedarray@0\.0\.6)$/u,
  ],
  ["OFL-1.1", /^@fontsource-variable\/(?:onest|oswald)@5\.3\.0$/u],
  ["Apache-2.0", /^caseless@0\.12\.0$/u],
  ["GPL-3.0-or-later", /^ffmpeg-static@5\.3\.0$/u],
  ["ISC", /^inherits@2\.0\.4$/u],
  ["BSD-3-Clause", /^parse-cache-control@1\.0\.1$/u],
  ["MIT", /^@astrojs\/compiler-binding-[a-z0-9-]+@0\.3\.1$/u],
  ["MIT", /^@bruits\/satteri-[a-z0-9-]+@0\.9\.5$/u],
  ["MIT", /^@esbuild\/[a-z0-9-]+@0\.28\.1$/u],
  [
    "MIT",
    /^@emnapi\/(?:core@1\.11\.1|runtime@1\.11\.[13]|wasi-threads@1\.2\.2)$/u,
  ],
  ["MIT", /^@napi-rs\/wasm-runtime@1\.1\.6$/u],
  ["MIT", /^@rolldown\/binding-[a-z0-9-]+@1\.1\.5$/u],
  ["MIT", /^@tybys\/wasm-util@0\.10\.3$/u],
  ["MIT", /^fsevents@2\.3\.[23]$/u],
  [
    "Apache-2.0",
    /^@img\/sharp-(?:darwin-(?:arm64|x64)|freebsd-wasm32|linux-(?:arm|arm64|ppc64|riscv64|s390x|x64)|linuxmusl-(?:arm64|x64)|webcontainers-wasm32)@0\.35\.3$/u,
  ],
  ["LGPL-3.0-or-later", /^@img\/sharp-libvips-[a-z0-9-]+@1\.3\.2$/u],
  [
    "Apache-2.0 AND LGPL-3.0-or-later",
    /^@img\/sharp-win32-(?:arm64|ia32|x64)@0\.35\.3$/u,
  ],
  [
    "Apache-2.0 AND LGPL-3.0-or-later AND MIT",
    /^@img\/sharp-wasm32@0\.35\.3$/u,
  ],
  ["MPL-2.0", /^lightningcss-[a-z0-9-]+@1\.33\.0$/u],
  ["MIT", /^brace-expansion@5\.0\.9$/u],
  ["BSD-3-Clause", /^fast-uri@3\.1\.5$/u],
  ["MIT", /^js-yaml@4\.3\.1$/u],
  ["MIT", /^nanoid@3\.3\.18$/u],
]);

export function reviewedLicenseValue(choice, key) {
  if (!isRecord(choice)) {
    throw new Error(`${key} has an invalid license choice.`);
  }
  const expression = choice.expression;
  const license = choice.license;
  const value =
    typeof expression === "string"
      ? expression
      : isRecord(license) && typeof license.id === "string"
        ? license.id
        : isRecord(license) && typeof license.name === "string"
          ? license.name
          : undefined;
  if (value === undefined || !REVIEWED_LICENSE_VALUES.has(value)) {
    throw new Error(
      `${key} has an unreviewed or missing license: ${value ?? "UNKNOWN"}`,
    );
  }
  return value;
}

function reviewedLicenseMap(reviewedSbom) {
  if (!isRecord(reviewedSbom) || !Array.isArray(reviewedSbom.components)) {
    throw new Error("The committed SBOM cannot supply reviewed licenses.");
  }
  const licenses = new Map();
  for (const component of reviewedSbom.components) {
    if (!isRecord(component)) {
      throw new Error("The committed SBOM contains an invalid component.");
    }
    const name = readString(component.name, "Reviewed component name");
    const version = readString(component.version, `${name} version`);
    const key = `${name}@${version}`;
    if (licenses.has(key) || !Array.isArray(component.licenses)) {
      throw new Error(`${key} has duplicate or invalid reviewed license data.`);
    }
    if (component.licenses.length !== 1) {
      throw new Error(`${key} must have exactly one reviewed license choice.`);
    }
    licenses.set(key, reviewedLicenseValue(component.licenses[0], key));
  }
  return licenses;
}

function bootstrapLicense(key) {
  const matches = BOOTSTRAP_LICENSE_RULES.filter(([, pattern]) =>
    pattern.test(key),
  );
  if (matches.length > 1) {
    throw new Error(`${key} matches multiple bootstrap license policies.`);
  }
  return matches[0]?.[0];
}

export function resolveLicensePolicy(packages, reviewedSbom) {
  const reviewedLicenses = reviewedLicenseMap(reviewedSbom);
  return new Map(
    packages.map(({ key }) => {
      const license = reviewedLicenses.get(key) ?? bootstrapLicense(key);
      if (license === undefined || !REVIEWED_LICENSE_VALUES.has(license)) {
        throw new Error(
          `${key} has no reviewed license. Review it before regenerating the SBOM.`,
        );
      }
      return [key, license];
    }),
  );
}

export function createLicenseChoice(value) {
  if (!REVIEWED_LICENSE_VALUES.has(value)) {
    throw new Error(`Unreviewed license value: ${value}`);
  }
  if (SPDX_LICENSE_IDS.has(value)) {
    return { license: { id: value } };
  }
  if (REVIEWED_SPDX_EXPRESSIONS.has(value)) {
    return { expression: value };
  }
  return { license: { name: value } };
}
