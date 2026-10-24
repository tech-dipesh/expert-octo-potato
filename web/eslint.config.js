import js from "@eslint/js"
import { defineConfig } from "eslint/config"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig(
  { ignores: ["dist"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.strict, reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
    rules: { "@typescript-eslint/no-unused-vars": "error", "no-console": "error" },
  },
)
