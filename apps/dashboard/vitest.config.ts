import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` throws unless the bundler applies React's `react-server`
      // export condition, which vitest does not. Aliasing it to the package's
      // own no-op build is exactly what Next.js resolves it to on the server,
      // so the guard still holds in the real build — it just stops the test
      // runner tripping over it.
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
