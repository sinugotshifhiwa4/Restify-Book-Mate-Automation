import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { TEST_TIMEOUT, EXPECT_TIMEOUT } from "./src/configuration/timeouts/timeout.config";
import EnvironmentDetector from "./src/configuration/environment/detector/environmentDetector";
import WorkerAllocator from "./src/configuration/environment/detector/workerAllocator";

const isCI = EnvironmentDetector.isCI();

const reportConfig = {
  open: process.env.CI ? "never" : "always",
  folderPath: "ortoni-report",
  filename: "index.html",
  logo: path.join(process.cwd(), ""),
  title: "Restify BookMate Automation Test Report",
  showProject: !true,
  projectName: "restify-book-mate-automation",
  testType: "e2e",
  authorName: "Tshifhiwa Sinugo",
  base64Image: false,
  stdIO: false,
  preferredTheme: "dark",
  chartType: "doughnut",
};

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: TEST_TIMEOUT,
  expect: {
    timeout: EXPECT_TIMEOUT,
  },
  testDir: "./tests",
  globalSetup: "./src/configuration/environment/dotenv/global/globalSetup.ts",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: EnvironmentDetector.isShardingEnabled()
    ? WorkerAllocator.setupCIAllocator()
    : WorkerAllocator.setLocalWorkerCount("fixed-2"),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: isCI
    ? [
        ["html"],
        ["junit", { outputFile: "results.xml" }],
        ["playwright-trx-reporter", { outputFile: "results.trx" }],
        ["dot"],
      ]
    : [
        ["html", { open: "never" }],
        ["ortoni-report", reportConfig],
        ["junit", { outputFile: "results.xml" }],
        ["dot"],
      ],
  grep:
    typeof process.env.PLAYWRIGHT_GREP === "string"
      ? new RegExp(process.env.PLAYWRIGHT_GREP)
      : process.env.PLAYWRIGHT_GREP || /.*/,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    trace: "retain-on-failure",
    video: isCI ? "on" : "retain-on-failure",
    screenshot: isCI ? "only-on-failure" : "on",
    headless: isCI ? true : false,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
