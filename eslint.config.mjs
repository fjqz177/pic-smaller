import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "pic-compress-wasm/pkg",
      "public/wasm",
      "scripts",           // Node.js CJS build scripts, never linted before flat config
      "eslint.config.mjs", // self-ignore
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-empty": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
