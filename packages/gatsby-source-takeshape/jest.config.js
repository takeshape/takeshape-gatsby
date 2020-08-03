module.exports = {
  collectCoverage: true,
  globals: {
    'ts-jest': {
      packageJson: `${__dirname}/package.json`,
      tsConfig: `${__dirname}/tsconfig.json`,
    },
  },
  preset: `ts-jest`,
  testEnvironment: `node`,
}
