module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    // Possible Errors
    "no-console": "off", // Allow console for Lambda logging
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

    // Best Practices
    "eqeqeq": ["error", "always"],
    "no-var": "error",
    "prefer-const": "warn",

    // Stylistic
    "semi": ["error", "always"],
    "quotes": ["error", "double", { avoidEscape: true }],
    "comma-dangle": ["error", "always-multiline"],
    "indent": ["warn", 2, { SwitchCase: 1 }],
    "no-trailing-spaces": "warn",
    "eol-last": ["warn", "always"],
  },
  ignorePatterns: [
    "node_modules/",
    ".serverless/",
    "coverage/",
    "*.test.js",
  ],
};
