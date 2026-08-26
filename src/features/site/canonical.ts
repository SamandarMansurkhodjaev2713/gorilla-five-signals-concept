const ROOT_PATH = "/";

/**
 * Produces the single trailing-slash form used by page canonicals and sitemaps.
 */
export function canonicalizePagePath(pathname: string): string {
  if (!pathname.startsWith(ROOT_PATH)) {
    throw new Error(`Expected an absolute page path, received "${pathname}".`);
  }
  if (pathname.includes("?") || pathname.includes("#")) {
    throw new Error(
      `Expected a pathname without query or fragment, received "${pathname}".`,
    );
  }

  const withoutTrailingSlashes = pathname.replace(/\/+$/u, "");
  return withoutTrailingSlashes === ""
    ? ROOT_PATH
    : `${withoutTrailingSlashes}${ROOT_PATH}`;
}

/**
 * Resolves a normalized page path against the configured public origin.
 */
export function createCanonicalHref(pathname: string, site?: URL): string {
  const canonicalPath = canonicalizePagePath(pathname);
  return site === undefined ? canonicalPath : new URL(canonicalPath, site).href;
}
