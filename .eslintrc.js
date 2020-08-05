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
  plugins: [`prettier`, `import`],
  overrides: [
    {
      // JavaScript
      files: [`**/*.js`],
      parserOptions: {
        ecmaVersion: 2018,
      },
      rules: {
        quotes: [`error`, `backtick`],
      },
    },
    {
      // TypeScript
      files: [`**/*.ts`],
      extends: [
        `plugin:import/typescript`,
        `plugin:@typescript-eslint/recommended`,
        `prettier/@typescript-eslint`,
      ],
      parser: `@typescript-eslint/parser`,
      parserOptions: {
        ecmaVersion: 2018,
        project: [`packages/*/tsconfig.json`],
        sourceType: `module`,
        tsconfigRootDir: __dirname,
      },
      plugins: [`@typescript-eslint`],
      rules: {
        '@typescript-eslint/quotes': [`error`, `backtick`],
      },
    },
    {
      // JavaScript React / TypeScript React
      env: {
        browser: true,
        node: true,
        es6: true,
      },
      extends: [`plugin:react/recommended`],
      files: [`**/src/**/*.{js,jsx}`, `**/src/**/*.{ts,tsx}`],
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: `module`,
      },
      plugins: [`react`],
    },
    {
      // Jest test files
      env: {
        browser: false,
        'jest/globals': true,
        node: true,
      },
      extends: [`plugin:jest/recommended`],
      files: [`**/*.test.js`, `**/*.test.ts`],
    },
    // TypeScript ambient type defs
    {
      files: [`**/*.d.ts`],
      plugins: [`@typescript-eslint`],
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
        directory: `packages/*/tsconfig.json`,
        extensions: [`.ts`, `.tsx`],
      },
      node: {
        extensions: [`.js`, `.jsx`, `.json`],
      },
    },
  },
}
