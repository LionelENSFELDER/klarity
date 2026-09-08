import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    clearMocks: true,
  },
  resolve: {
    alias: [
      // Voir vitest-mocks/mui-icons-material.cjs : évite de charger le
      // barrel réel (~2000 fichiers), qui provoque un EMFILE sous Windows.
      {
        find: /^@mui\/icons-material$/,
        replacement: path.resolve(
          __dirname,
          "vitest-mocks/mui-icons-material.cjs",
        ),
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "@modules", replacement: path.resolve(__dirname, "./src/modules") },
      { find: "@lib", replacement: path.resolve(__dirname, "./src/lib") },
      { find: "@components", replacement: path.resolve(__dirname, "./src/components") },
    ],
  },
});
