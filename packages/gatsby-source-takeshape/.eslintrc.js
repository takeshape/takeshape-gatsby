module.exports = {
  extends: [`../../.eslintrc.js`],
  overrides: [
    {
      // TypeScript / React
      env: {
        browser: true,
        node: true,
        es6: true,
      },
      extends: [`plugin:react/recommended`],
      files: [`src/**/*.ts`],
      plugins: [`react`],
      settings: {
        react: {
          version: `detect`,
        },
      },
    },
  ],
}
