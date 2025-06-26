export default {
  testEnvironment: 'node',
  transform: {
    '^.+\.(js|jsx|ts|tsx)$' : 'babel-jest'
  },
  moduleNameMapper: {
    '^(\.{1,2}/.*)\.js$': '$1'
  },
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts', '**/__tests__/**/*.tsx', '**/?(*.)+(spec|test).tsx'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};