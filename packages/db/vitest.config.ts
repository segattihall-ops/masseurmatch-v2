import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    // These talk to a real Supabase project over the network.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
