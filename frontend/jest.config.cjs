/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  setupFiles: ['<rootDir>/tests/polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          module: 'commonjs',
          target: 'ES2022',
          esModuleInterop: true,
          skipLibCheck: true,
          strict: true,
          types: ['jest', 'node', '@testing-library/jest-dom'],
        },
      },
    ],
  },
  moduleNameMapper: { '\\.(css)$': '<rootDir>/tests/styleMock.cjs' },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/main.tsx'],
};
