export default {
  testEnvironment: "node",
  clearMocks: true,
  restoreMocks: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.js", "!src/**/*.config.js"],
};
