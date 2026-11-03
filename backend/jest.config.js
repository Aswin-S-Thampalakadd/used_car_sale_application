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
  moduleNameMapper: {
    "^firebase-admin/app$":  "<rootDir>/tests/__mocks__/firebase-admin-app.js",
    "^firebase-admin/auth$": "<rootDir>/tests/__mocks__/firebase-admin-auth.js",
    "^firebase-admin(.*)$":  "<rootDir>/tests/__mocks__/firebase-admin-app.js",
    "firebaseAdmin\\.js$":   "<rootDir>/tests/__mocks__/firebaseAdmin.js",
  },
};
