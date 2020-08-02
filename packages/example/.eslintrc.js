module.exports = {
  extends: [`../../.eslintrc.js`],
  overrides: [
    {
      // JavaScript / React
      env: {
        browser: true,
        node: true,
        es6: true,
      },
      extends: [`plugin:react/recommended`],
      files: [`src/**/*.js`, `src/**/*.jsx`],
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: `module`,
      },
      plugins: [`react`],
      settings: {
        'import/resolver': {
          node: {
            extensions: [`.js`, `.jsx`, `.json`],
          },
        },
        react: {
          version: `detect`,
        },
      },
    },
  ],
}
