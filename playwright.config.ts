import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3005",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --port 3005",
    url: "http://localhost:3005",
    reuseExistingServer: true,
    timeout: 120000,
    env: {
      PORT: "3005",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
