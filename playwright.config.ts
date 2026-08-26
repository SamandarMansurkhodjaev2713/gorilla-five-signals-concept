import { defineConfig, devices } from "@playwright/test";

const APPLICATION_ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4321";
const TEST_WORKERS = 2;
const PREVIEW_START_TIMEOUT_MS = 60_000;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: TEST_WORKERS,
  timeout: 45_000,
  expect: {
    timeout: 7_500,
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
    },
  },
  outputDir: "test-results/playwright",
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: APPLICATION_ORIGIN,
    colorScheme: "dark",
    locale: "uz-UZ",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "corepack pnpm run preview --host 127.0.0.1 --port 4321",
    url: APPLICATION_ORIGIN,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    timeout: PREVIEW_START_TIMEOUT_MS,
  },
});
