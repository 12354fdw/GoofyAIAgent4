import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: {
            globals: globals.browser,
        },
    },
    {
        files: ["**/*.js"],
        languageOptions: {
            sourceType: "commonjs",
        },
    },
    ...tseslint.configs.recommended,
    {
        plugins: { prettier },
        rules: {
            "prettier/prettier": "warn",
        },
    },
    prettierConfig,
]);
