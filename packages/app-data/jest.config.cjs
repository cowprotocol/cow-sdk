module.exports = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/src/**/*.spec.ts', '**/test/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.cjs'],
}
