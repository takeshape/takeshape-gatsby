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
        // needing this here also seems pnpm related
        'import/resolver': {
          node: {
            extensions: [`.js`, `.jsx`, `.json`],
          },
        },
      },
    },
  ],
}
