module.exports = {
  'src/**/*.{ts}': () => 'tsc -p tsconfig.check.json',
  'src/**/*.{ts,js}': [
    'eslint --fix --config .eslintrc.js',
    'prettier --write --config ../../prettierrc.js',
  ],
}
