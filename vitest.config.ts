import { defineConfig } from "vitest/config";

// Unit tests only. The Playwright e2e suite under tests/e2e is run separately
// via `npm run test:e2e` and must not be picked up by vitest.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
