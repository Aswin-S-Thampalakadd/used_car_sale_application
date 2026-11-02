describe("Login Page", () => {
  beforeEach(() => {
    cy.stubAPIs();
    cy.visit("/login");
    cy.dismissCookieBanner();
  });

  it("renders the login form with customer tab active by default", () => {
    cy.get(".al-form-title").should("contain.text", "Welcome back");
    cy.get('[role="tab"][aria-selected="true"]').should("contain.text", "Customer");
    cy.get("#al-email").should("be.visible");
    cy.get("#al-password").should("be.visible");
    cy.get(".al-submit").should("be.visible");
  });

  it("switches to dealer tab and back", () => {
    cy.get('[role="tab"]').contains("Dealer").click();
    cy.get('[role="tab"][aria-selected="true"]').should("contain.text", "Dealer");
    cy.get('[role="tab"]').contains("Customer").click();
    cy.get('[role="tab"][aria-selected="true"]').should("contain.text", "Customer");
  });

  it("shows validation error when submitting empty form", () => {
    cy.get(".al-submit").click();
    cy.get("#al-email:invalid").should("exist");
  });

  it("shows API error for wrong credentials", () => {
    cy.intercept("POST", "**/api/v1/auth/customer/login", {
      statusCode: 401,
      body: { success: false, message: "Invalid email or password" },
    }).as("badLogin");

    cy.get("#al-email").type("wrong@example.com");
    cy.get("#al-password").type("wrongpass");
    cy.get(".al-submit").click();
    cy.wait("@badLogin");
    cy.get(".al-error[role='alert']").should("contain.text", "Invalid email or password");
  });

  it("shows account inactive error", () => {
    cy.intercept("POST", "**/api/v1/auth/customer/login", {
      statusCode: 403,
      body: { success: false, message: "Account is inactive" },
    }).as("inactiveLogin");

    cy.get("#al-email").type("inactive@example.com");
    cy.get("#al-password").type("pass123");
    cy.get(".al-submit").click();
    cy.wait("@inactiveLogin");
    cy.get(".al-error[role='alert']").should("contain.text", "Account is inactive");
  });

  it("successfully logs in as customer and redirects to /used-cars", () => {
    cy.fixture("customer-user.json").then((user) => {
      cy.intercept("POST", "**/api/v1/auth/customer/login", {
        statusCode: 200,
        body: { message: "Login successful", user, accessToken: "fake-access", refreshToken: "fake-refresh" },
      }).as("customerLogin");
    });

    cy.get("#al-email").type("cypress.customer@example.com");
    cy.get("#al-password").type("Cypress@123");
    cy.get(".al-submit").click();
    cy.wait("@customerLogin");
    cy.url().should("include", "/used-cars");
  });

  it("successfully logs in as dealer and redirects to /dashboard", () => {
    cy.fixture("dealer-user.json").then((user) => {
      cy.intercept("POST", "**/api/v1/auth/dealer/login", {
        statusCode: 200,
        body: { message: "Dealer login successful", user, accessToken: "fake-access", refreshToken: "fake-refresh" },
      }).as("dealerLogin");
    });

    cy.get('[role="tab"]').contains("Dealer").click();
    cy.get("#al-email").type("cypress.dealer@example.com");
    cy.get("#al-password").type("Cypress@123");
    cy.get(".al-submit").click();
    cy.wait("@dealerLogin");
    cy.url().should("include", "/dashboard");
  });

  it("toggles password visibility", () => {
    cy.get("#al-password").type("mysecret").should("have.attr", "type", "password");
    cy.get(".al-eye-btn").click();
    cy.get("#al-password").should("have.attr", "type", "text");
    cy.get(".al-eye-btn").click();
    cy.get("#al-password").should("have.attr", "type", "password");
  });

  it("shows a Sign in button label matching selected tab", () => {
    cy.get(".al-submit").should("contain.text", "Sign in as Customer");
    cy.get('[role="tab"]').contains("Dealer").click();
    cy.get(".al-submit").should("contain.text", "Sign in as Dealer");
  });

  it("renders a Google Sign-In button", () => {
    cy.contains("button", /continue with google|sign in with google/i).should("be.visible");
  });

  it("has a link to the signup page", () => {
    cy.contains("a", "Create one free").click();
    cy.url().should("include", "/signup");
  });
});
