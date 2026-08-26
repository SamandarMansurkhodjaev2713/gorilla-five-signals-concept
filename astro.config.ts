import { defineConfig } from "astro/config";

import { parsePublicEnvironment } from "./src/config/environment";

const environment = parsePublicEnvironment(process.env);
const canonicalSite =
  environment.siteOrigin === undefined ? {} : { site: environment.siteOrigin };

export function createAstroConfig(outputDirectory?: string) {
  return defineConfig({
    ...canonicalSite,
    ...(environment.basePath === undefined
      ? {}
      : { base: environment.basePath }),
    ...(outputDirectory === undefined ? {} : { outDir: outputDirectory }),
    output: "static",
    trailingSlash: "always",
    build: {
      assets: "_assets",
      inlineStylesheets: "always",
    },
    compressHTML: true,
    devToolbar: {
      enabled: false,
    },
    security: {
      checkOrigin: true,
    },
    vite: {
      build: {
        sourcemap: false,
      },
    },
  });
}

export default createAstroConfig();
