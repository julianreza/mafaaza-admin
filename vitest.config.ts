import { defineConfig } from "vitest/config"
import { resolve } from "node:path"

// Node-environment unit tests for server actions + server components.
// No jsdom/RTL — the products logic under test is server-side, so we mock the
// API client and Next primitives and assert on calls/return values.
export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["app/**/*.test.{ts,tsx}", "lib/**/*.test.ts", "components/**/*.test.ts"],
  },
})
