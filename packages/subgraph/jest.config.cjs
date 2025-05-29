/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['src/graphql.ts'],
  moduleDirectories: ['node_modules'],
  modulePaths: ['<rootDir>/'],
  setupFiles: ['<rootDir>/setupTests.cjs'],
}
