module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.json',
    },
  },
  transformIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageReporters: ['html'],
}
