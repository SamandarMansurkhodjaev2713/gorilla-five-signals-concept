import { defineConfig, devices } from "@playwright/test";

const PERFORMANCE_ORIGIN = "http://127.0.0.1:4322";
const PREVIEW_START_TIMEOUT_MS = 60_000;

export default defineConfig({
  testDir: "./tests/performance",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 120_000,
  outputDir: "test-results/performance",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "performance-report" }],
  ],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: PERFORMANCE_ORIGIN,
    colorScheme: "dark",
    launchOptions: {
      args: [
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
      ],
    },
    serviceWorkers: "block",
    trace: "retain-on-failure",
    viewport: { height: 900, width: 1440 },
  },
  projects: [
    { name: "chromium-performance", use: { browserName: "chromium" } },
  ],
  webServer: {
    command: "corepack pnpm run preview --host 127.0.0.1 --port 4322",
    reuseExistingServer: false,
    stderr: "pipe",
    stdout: "ignore",
    timeout: PREVIEW_START_TIMEOUT_MS,
    url: `${PERFORMANCE_ORIGIN}/uz/`,
  },
});
