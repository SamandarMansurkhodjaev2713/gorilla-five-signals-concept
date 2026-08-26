import eslint from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import astro from "eslint-plugin-astro";
import globals from "globals";

const typescriptRules = {
  ...typescriptEslint.configs["recommended-type-checked"].rules,
  ...typescriptEslint.configs["stylistic-type-checked"].rules,
  "@typescript-eslint/consistent-type-imports": "error",
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-floating-promises": "error",
  "@typescript-eslint/no-non-null-assertion": "error",
  "@typescript-eslint/no-unsafe-type-assertion": "error",
};

export default [
  {
    ignores: [
      ".astro/**",
      ".cache/**",
      ".codex-*",
      ".tmp/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "performance-report/**",
      "playwright-report/**",
      "test-results/**",
      "_reference/**",
      "_reference-analysis/**",
      "_research/**",
      "media-source/**",
    ],
  },
  eslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ["**/*.{ts,mts,cts}"],
    languageOptions: {
      globals: globals.browser,
      parser: typescriptParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    rules: typescriptRules,
  },
  {
    files: [
      "scripts/**/*.mjs",
      "*.config.{js,mjs,ts}",
      "astro.config.ts",
      "eslint.config.js",
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    rules: {
      "no-console": "error",
    },
  },
  {
    files: ["scripts/**/*.mjs"],
    rules: {
      "no-console": "off",
    },
  },
];
