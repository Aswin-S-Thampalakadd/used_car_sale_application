describe("Signup Page", () => {
  beforeEach(() => {
    cy.stubAPIs();
    cy.visit("/signup");
    cy.dismissCookieBanner();
  });

  it("renders the signup page with customer tab active by default", () => {
    cy.get(".al-form-title").should("contain.text", "Create your account");
    cy.get('[role="tab"][aria-selected="true"]').should("contain.text", "Customer");
    cy.get("#c-name").should("be.visible");
    cy.get("#c-email").should("be.visible");
    cy.get("#c-password").should("be.visible");
  });

  it("switches to dealer tab and shows dealer-specific fields", () => {
    cy.get('[role="tab"]').contains("Dealer").click();
    cy.get('[role="tab"][aria-selected="true"]').should("contain.text", "Dealer");
    cy.get("#d-name").should("be.visible");
    cy.get("#d-email").should("be.visible");
    cy.get("#d-dealname").should("be.visible");
    cy.get("#d-city").should("be.visible");
    cy.get("#d-state").should("be.visible");
  });

  it("shows required field error when submitting empty customer form", () => {
    cy.get(".al-submit").click();
    cy.get("#c-name:invalid").should("exist");
  });

  it("shows error for duplicate email on customer signup", () => {
    cy.intercept("POST", "**/api/v1/auth/customer/signup", {
      statusCode: 409,
      body: { success: false, message: "Email already exists" },
    }).as("dupEmail");

    cy.get("#c-name").type("Test User");
    cy.get("#c-email").type("existing@example.com");
    cy.get("#c-password").type("Pass@123");
    cy.get(".al-submit").click();
    cy.wait("@dupEmail");
    cy.get(".al-error[role='alert']").should("contain.text", "Email already exists");
  });

  it("successfully creates a customer account and redirects to /used-cars", () => {
    cy.fixture("customer-user.json").then((user) => {
      cy.intercept("POST", "**/api/v1/auth/customer/signup", {
        statusCode: 201,
        body: { message: "Customer account created successfully", user, accessToken: "fake-access", refreshToken: "fake-refresh" },
      }).as("customerSignup");
    });

    cy.get("#c-name").type("New Customer");
    cy.get("#c-email").type("new@example.com");
    cy.get("#c-password").type("Pass@1234");
    cy.get(".al-submit").click();
    cy.wait("@customerSignup");
    cy.url().should("include", "/used-cars");
  });

  it("shows error when dealer signup is missing dealership name", () => {
    cy.get('[role="tab"]').contains("Dealer").click();
    cy.get("#d-name").type("Test Dealer");
    cy.get("#d-email").type("dealer@example.com");
    cy.get("#d-password").type("Pass@1234");
    cy.get(".al-submit").click();
    cy.get("#d-dealname:invalid").should("exist");
  });

  it("successfully creates a dealer account and redirects to /dashboard", () => {
    cy.fixture("dealer-user.json").then((user) => {
      cy.intercept("POST", "**/api/v1/auth/dealer/signup", {
        statusCode: 201,
        body: { message: "Dealer account created successfully", user, dealerProfile: {}, accessToken: "fake-access", refreshToken: "fake-refresh" },
      }).as("dealerSignup");

      cy.intercept("GET", "**/api/v1/dealers/me/profile", { statusCode: 200, body: { id: 1, dealershipName: "Cypress Motors" } });
      cy.intercept("GET", "**/api/v1/dealers/me/cars", { statusCode: 200, body: { cars: [] } });
      cy.intercept("GET", "**/api/v1/subscriptions/my-plan", { statusCode: 200, body: { subscription: { planType: "free", carLimit: 5 } } });
      cy.intercept("GET", "**/api/v1/enquiries/me", { statusCode: 200, body: { enquiries: [] } });
    });

    cy.get('[role="tab"]').contains("Dealer").click();
    cy.get("#d-name").type("Cypress Dealer");
    cy.get("#d-email").type("cypressdealer@example.com");
    cy.get("#d-password").type("Pass@1234");
    cy.get("#d-dealname").type("Cypress Motors");
    cy.get("#d-city").type("Kochi");
    cy.get("#d-state").type("Kerala");
    cy.get(".al-submit").click();
    cy.wait("@dealerSignup");
    cy.url().should("include", "/dashboard");
  });

  it("renders Google Sign-In button on customer tab", () => {
    cy.contains("button", /continue with google|sign in with google/i).should("be.visible");
  });

  it("renders Google Sign-In button on dealer tab", () => {
    cy.get('[role="tab"]').contains("Dealer").click();
    cy.contains("button", /continue with google|sign in with google/i).should("be.visible");
  });

  it("has a link back to the login page", () => {
    cy.contains("a", "Sign in").click();
    cy.url().should("include", "/login");
  });
});
