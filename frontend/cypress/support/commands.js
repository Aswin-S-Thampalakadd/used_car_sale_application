Cypress.Commands.add("loginAsCustomer", () => {
  cy.request("POST", `${Cypress.env("apiUrl")}/auth/customer/login`, {
    email: Cypress.env("customerEmail"),
    password: Cypress.env("customerPassword"),
  }).then((res) => {
    window.localStorage.setItem("accessToken", res.body.accessToken);
    window.localStorage.setItem("refreshToken", res.body.refreshToken);
    window.localStorage.setItem("user", JSON.stringify(res.body.user));
  });
});

Cypress.Commands.add("loginAsDealer", () => {
  cy.request("POST", `${Cypress.env("apiUrl")}/auth/dealer/login`, {
    email: Cypress.env("dealerEmail"),
    password: Cypress.env("dealerPassword"),
  }).then((res) => {
    window.localStorage.setItem("accessToken", res.body.accessToken);
    window.localStorage.setItem("refreshToken", res.body.refreshToken);
    window.localStorage.setItem("user", JSON.stringify(res.body.user));
  });
});

Cypress.Commands.add("clearAuth", () => {
  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("refreshToken");
  window.localStorage.removeItem("user");
});

Cypress.Commands.add("stubAPIs", () => {
  cy.intercept("GET", "**/api/v1/cars*", {
    fixture: "cars.json",
  }).as("getCars");

  cy.intercept("GET", "**/api/v1/cars/brands", {
    fixture: "brands.json",
  }).as("getBrands");

  cy.intercept("GET", "**/api/v1/cars/featured*", {
    fixture: "featured-cars.json",
  }).as("getFeatured");

  cy.intercept("GET", "**/api/v1/cars/recent*", {
    fixture: "featured-cars.json",
  }).as("getRecent");

  cy.intercept("GET", "**/api/v1/stats", {
    fixture: "stats.json",
  }).as("getStats");

  cy.intercept("GET", "**/api/v1/reviews/app*", {
    fixture: "reviews.json",
  }).as("getReviews");

  cy.intercept("GET", "**/api/v1/subscriptions/plans", {
    fixture: "plans.json",
  }).as("getPlans");
});

Cypress.Commands.add("dismissCookieBanner", () => {
  cy.get("body").then(($body) => {
    if ($body.find("[class*='cookie']").length > 0) {
      cy.get("[class*='cookie']").within(() => {
        cy.contains("button", /accept|ok|got it/i).click({ force: true });
      });
    }
  });
});
