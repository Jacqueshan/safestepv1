// functions/.eslintrc.js
module.exports = {
  root: true,
  env: {
    es6: true, // Allows ES6 syntax (like const/let)
    node: true, // <-- IMPORTANT: Defines Node.js global variables (like require, module, exports) and Node.js scoping.
  },
  extends: [
    "eslint:recommended",
    "google", // Uses Google's recommended style guide
  ],
  rules: {
    "quotes": ["error", "double"], // Example rule: enforces double quotes
    "indent": "off", // Turn off indent rule if it causes issues with your style
    "object-curly-spacing": ["error", "always"], // Example: enforce spacing inside braces
    // Add or modify other rules as needed
    "require-jsdoc": "off", // Temporarily disable jsdoc requirement if needed
    "valid-jsdoc": "off", // Temporarily disable jsdoc requirement if needed
  },
  // Optional: If you plan to use very specific JS versions
  // parserOptions: {
  //   ecmaVersion: 2020, // Or your target version
  // },
};