const SAFE_BASE_PATH_PATTERN =
  /^\/[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/u;

/** Validates an optional single-segment deployment base. */
export function normalizeDeploymentBase(value) {
  if (value === undefined || value === "") {
    return "";
  }
  if (!SAFE_BASE_PATH_PATTERN.test(value)) {
    throw new Error("PUBLIC_BASE_PATH is not a safe absolute path segment.");
  }
  return value;
}

/** Removes a known deployment base from an application-root reference. */
export function withoutDeploymentBase(referencePath, deploymentBase) {
  if (deploymentBase === "" || referencePath === "") {
    return referencePath;
  }
  if (referencePath === deploymentBase) {
    return "/";
  }
  return referencePath.startsWith(`${deploymentBase}/`)
    ? referencePath.slice(deploymentBase.length)
    : referencePath;
}
