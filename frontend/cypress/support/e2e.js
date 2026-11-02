import "./commands";

Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("ResizeObserver loop") ||
    err.message.includes("Non-Error promise rejection") ||
    err.message.includes("Firebase") ||
    err.message.includes("Loading chunk")
  ) {
    return false;
  }
});

beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
});
