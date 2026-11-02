export default {
  testEnvironment: "node",
  injectGlobals: true,
  clearMocks: true,
  restoreMocks: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.js", "!src/**/*.config.js"],
  testEnvironmentOptions: {
    NODE_ENV: "test",
  },
  setupFiles: ["./tests/setup/env.js"],
};
