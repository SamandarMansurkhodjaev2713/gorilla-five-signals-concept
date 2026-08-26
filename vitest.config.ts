import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    clearMocks: true,
    coverage: {
      exclude: ["**/*.astro", "src/env.d.ts", "src/content.config.ts"],
      include: [
        "src/config/**/*.ts",
        "src/content/schema/**/*.ts",
        "src/features/compare/compare-state.ts",
        "src/features/locator/locator-state.ts",
        "src/features/product-explorer/product-explorer-state.ts",
        "src/features/site/canonical.ts",
        "src/features/site/localization.ts",
        "src/motion/capability-policy.ts",
        "src/motion/scene-registry.ts",
      ],
      provider: "v8",
      reporter: ["text", "json-summary"],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
    environment: "node",
    include: ["tests/unit/**/*.spec.ts"],
    mockReset: true,
    restoreMocks: true,
  },
});
