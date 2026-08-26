const ROOT_PATH = "/";

function normalizedBasePath(): string {
  const configured = import.meta.env.BASE_URL;
  if (configured === ROOT_PATH) {
    return "";
  }
  return configured.replace(/\/+$/u, "");
}

const BASE_PATH = normalizedBasePath();

/** Prefixes an absolute application path with the configured deployment base. */
export function withBasePath(path: string): string {
  if (!path.startsWith(ROOT_PATH)) {
    throw new Error(
      `Expected an absolute application path, received "${path}".`,
    );
  }
  if (
    BASE_PATH === "" ||
    path === BASE_PATH ||
    path.startsWith(`${BASE_PATH}/`)
  ) {
    return path;
  }
  return `${BASE_PATH}${path}`;
}

/** Removes the deployment base before locale-aware route parsing. */
export function withoutBasePath(path: string): string {
  const matchesBase = path === BASE_PATH || path.startsWith(`${BASE_PATH}/`);
  if (BASE_PATH === "" || !matchesBase) {
    return path;
  }
  const unprefixed = path.slice(BASE_PATH.length);
  return unprefixed === "" ? ROOT_PATH : unprefixed;
}
