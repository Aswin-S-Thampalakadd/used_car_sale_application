const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    video: true,
    videosFolder: "cypress/videos",
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/screenshots",
    env: {
      apiUrl: "http://localhost:5000/api/v1",
      customerEmail: "cypress.customer@example.com",
      customerPassword: "Cypress@123",
      dealerEmail: "cypress.dealer@example.com",
      dealerPassword: "Cypress@123",
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
