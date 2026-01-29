import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier"
import globals from "globals"

export default defineConfig([
  {
    ignores: ["docs", "**/*.test.{js,jsx,ts,tsx}"]
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      }
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react,
      "react-hooks": reactHooks,
      prettier,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      /* ---------- TypeScript ---------- */
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",

      /* ---------- React ---------- */
      "react/react-in-jsx-scope": "off", // React 17+
      "react/prop-types": "off", // using TS instead

      /* ---------- Hooks ---------- */
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "no-unused-vars": ["error", {
        "vars": "all",
        "args": "none",
        "caughtErrors": "all",
        "ignoreRestSiblings": false,
        "ignoreUsingDeclarations": false,
        "reportUsedIgnorePattern": false
      }]
    },
  },
  {
    rules: prettierConfig.rules,
  },
]);