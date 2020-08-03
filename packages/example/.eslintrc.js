module.exports = {
  extends: [`../../.eslintrc.js`],
  overrides: [
    {
      files: [`src/**/*.js`, `src/**/*.jsx`],
      settings: {
        // pnpm necessitates this here for resolution
        react: {
          version: `detect`,
        },
      },
    },
  ],
}
