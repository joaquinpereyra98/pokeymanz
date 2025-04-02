import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import html from "@html-eslint/eslint-plugin";
import htmlParser from "@html-eslint/parser";

export default defineConfig([
  {
    ignores: ["foundry/**/*"],
  },
  {
    files: ["**/*.{mjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    rules: {
      // General JS Rules
      indent: ["error", 2, { SwitchCase: 1 }],
      "comma-dangle": ["error", "always-multiline"],
      "linebreak-style": ["error", "windows"],
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "quote-props": ["error", "as-needed"],
      "array-bracket-newline": ["error", "consistent"],
      "key-spacing": "error",
      "space-in-parens": ["error", "never"],
      "space-infix-ops": 2,
      "keyword-spacing": 2,
      "semi-spacing": 2,
      "no-multi-spaces": 2,
      "no-extra-semi": 2,
      "no-whitespace-before-property": 2,
      "space-unary-ops": 2,
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "block", next: "*" },
      ],
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
      "object-curly-spacing": ["error", "always"],
      "comma-spacing": ["error"],
      "no-undef": "off",
      "space-before-blocks": 2,
      "arrow-spacing": 2,
      "eol-last": ["error", "always"],
      "no-mixed-operators": [
        "error",
        {
          allowSamePrecedence: true,
          groups: [
            [
              "==",
              "!=",
              "===",
              "!==",
              ">",
              ">=",
              "<",
              "<=",
              "&&",
              "||",
              "in",
              "instanceof",
            ],
          ],
        },
      ],

      // Disabled Rules
      "no-unused-vars": 0,
    },
  },
  {
    ...html.configs["flat/recommended"],
    files: ["../.hbs"],
    plugins: {
      "@html-eslint": html,
    },
    languageOptions: {
      parser: htmlParser,
    },
    rules: {
      ...html.configs["flat/recommended"].rules,
      "@html-eslint/indent": ["error", 4, { handlebars: "ignore" }],
      "@html-eslint/max-len": ["error", { code: 120, ignoreTemplateLiterals: true, ignoreStrings: true }],
      "no-multi-spaces": "error",
    },
  },
]);
