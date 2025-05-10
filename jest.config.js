module.exports = {
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@toolpad/core|react-router-dom|axios)/)",
  ],
  moduleNameMapper: {
    '^@toolpad/core/AppProvider$': '<rootDir>/src/__mocks__/@toolpad/core/AppProvider.js',
    '^@toolpad/core/Account$': '<rootDir>/src/__mocks__/@toolpad/core/Account.js',
    '^@toolpad/core/(.*)$': '<rootDir>/src/__mocks__/@toolpad/core.js',
    '^axios$': '<rootDir>/src/__mocks__/axios.js',
  },
  testEnvironment: 'jsdom',
};
