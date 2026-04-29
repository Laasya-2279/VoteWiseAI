const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

const customConfig = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx}',
    '!src/lib/firebase.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.{js,jsx}'],
  moduleNameMapper: { 
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  coverageDirectory: 'coverage',
  coverageThreshold: { global: { lines: 85, functions: 85, branches: 75, statements: 85 } },
};

module.exports = createJestConfig(customConfig);
