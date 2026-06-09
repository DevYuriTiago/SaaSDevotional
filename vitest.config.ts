import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./src/__tests__/setup.ts"],
        include: ["src/__tests__/**/*.test.{ts,tsx}"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            reportsDirectory: "./coverage",
            include: [
                "src/lib/**/*.ts",
                "src/store/**/*.ts",
                "src/app/api/**/*.ts",
                "src/components/**/*.tsx",
            ],
            exclude: ["src/__tests__/**", "**/*.d.ts", "**/node_modules/**"],
            thresholds: {
                statements: 70,
                branches: 65,
                functions: 70,
                lines: 70,
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
});
