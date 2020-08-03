module.exports = {
  extends: [`../../.eslintrc.js`],
  overrides: [
    {
      files: [`src/**/*.ts`, `src/**/*.tsx`],
      settings: {
        react: {
          version: `detect`,
        },
      },
    },
  ],
}
