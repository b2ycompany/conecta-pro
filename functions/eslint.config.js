// functions/eslint.config.js

const globals = require("globals");
const tseslint = require("typescript-eslint");
const eslintPluginGoogle = require("eslint-config-google");

module.exports = [
  {
    ignores: ["lib/**"],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "quotes": ["error", "double"],
      "import/no-unresolved": "off",
      "indent": ["error", 2],
      "require-jsdoc": "off",
      "max-len": ["error", { "code": 120 }],
      "object-curly-spacing": ["error", "always"],
    },
  },
];