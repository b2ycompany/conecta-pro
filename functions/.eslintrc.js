// functions/.eslintrc.js

module.exports = {
  // A SOLUÇÃO DEFINITIVA ESTÁ AQUI. 
  // Esta linha diz ao ESLint para parar de procurar configurações em pastas superiores.
  root: true, 
  
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
    tsconfigRootDir: __dirname, // Garante que ele encontra o tsconfig.json corretamente
  },
  ignorePatterns: [
    "/lib/**/*", // Ignora a pasta de output do TypeScript
    ".eslintrc.js", // Ignora este próprio ficheiro
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "require-jsdoc": 0, // Desativa a regra que obriga a ter JSDoc
    "max-len": ["error", { "code": 120 }], // Aumenta o limite de caracteres por linha
  },
};