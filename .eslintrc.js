module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['jest'],
  extends: ['plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
  ignorePatterns: ['gatsby-node.js'],
  rules: {
    'valid-jsdoc': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-warning-comments': 'warn'
  },
  env: {
    'jest/globals': true,
    node: true
  }
};
