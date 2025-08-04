// Jest configuration for ES modules
export default {
  testEnvironment: 'jsdom',
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/vendor/**',
    '!js/**/*.worker.js'
  ]
};
