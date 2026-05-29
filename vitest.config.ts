import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests for the pure-logic modules (analysis engine, hardware DB, FPS
// estimator, percentile, score utils). Scoped to `src/**` so it never picks up
// the Playwright e2e specs under `tests/` and `specs/`.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    globals: true,
  },
});
