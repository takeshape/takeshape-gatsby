module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: [
    `eslint:recommended`,
    `plugin:prettier/recommended`,
    `plugin:import/errors`,
    `plugin:import/warnings`,
  ],
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: [`prettier`],
  overrides: [
    {
      // JavaScript
      files: [`**/*.js`],
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: `module`,
        tsconfigRootDir: __dirname,
      },
      rules: {
        quotes: [`error`, `backtick`],
      },
    },
    {
      // TypeScript
      extends: [
        `plugin:import/typescript`,
        `plugin:@typescript-eslint/recommended`,
        `prettier/@typescript-eslint`,
      ],
      files: [`**/*.ts`],
      parser: `@typescript-eslint/parser`,
      parserOptions: {
        ecmaVersion: 2018,
        project: [`tsconfig.json`],
        sourceType: `module`,
        tsconfigRootDir: __dirname,
      },
      plugins: [`@typescript-eslint`],
      rules: {
        '@typescript-eslint/quotes': [`error`, `backtick`],
      },
    },
    // TypeScript ambient type defs
    {
      files: [`**/*.d.ts`],
      rules: {
        '@typescript-eslint/no-unused-vars': `off`,
      },
    },
  ],
  root: true,
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': [`.ts`],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        directory: `*/tsconfig.json`,
      },
    },
  },
}
