const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './web',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/web/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/web/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/mobile/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/mobile/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/shared/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/shared/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    '<rootDir>/web/src/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/mobile/src/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/shared/src/**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/web/src/**/*.d.ts',
    '!<rootDir>/mobile/src/**/*.d.ts',
    '!<rootDir>/shared/src/**/*.d.ts',
    '!<rootDir>/web/src/**/*.stories.{js,jsx,ts,tsx}',
    '!<rootDir>/mobile/src/**/*.stories.{js,jsx,ts,tsx}',
    '!<rootDir>/shared/src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/web/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/src/$1',
    '^@mobile/(.*)$': '<rootDir>/mobile/src/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/mobile/node_modules/',
    '<rootDir>/web/node_modules/',
    '<rootDir>/shared/node_modules/',
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
  projects: [
    {
      displayName: 'web',
      testMatch: [
        '<rootDir>/web/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/web/**/*.{test,spec}.{js,jsx,ts,tsx}',
      ],
      setupFilesAfterEnv: ['<rootDir>/web/jest.setup.js'],
      testEnvironment: 'jsdom',
    },
    {
      displayName: 'mobile',
      testMatch: [
        '<rootDir>/mobile/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/mobile/**/*.{test,spec}.{js,jsx,ts,tsx}',
      ],
      setupFilesAfterEnv: ['<rootDir>/mobile/jest.setup.js'],
      testEnvironment: 'node',
    },
    {
      displayName: 'shared',
      testMatch: [
        '<rootDir>/shared/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/shared/**/*.{test,spec}.{js,jsx,ts,tsx}',
      ],
      setupFilesAfterEnv: ['<rootDir>/shared/jest.setup.js'],
      testEnvironment: 'node',
    },
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig); 