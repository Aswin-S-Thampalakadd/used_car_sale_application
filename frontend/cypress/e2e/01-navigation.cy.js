describe("Navigation and Header", () => {
  beforeEach(() => {
    cy.stubAPIs();
    cy.visit("/");
    cy.dismissCookieBanner();
  });

  it("renders the header with logo, nav links and auth buttons", () => {
    cy.get(".hdr-logo img").should("be.visible").and("have.attr", "alt", "VandiMart");
    cy.get(".hdr-nav").should("be.visible");
    cy.get(".hdr-btn--ghost").should("contain.text", "Log in");
    cy.get(".hdr-btn--primary").should("contain.text", "Sign up");
  });

  it("navigates to home page on logo click", () => {
    cy.visit("/login");
    cy.get(".hdr-logo").click();
    cy.url().should("eq", Cypress.config("baseUrl") + "/");
  });

  it("navigates to /used-cars from Browse Cars nav link", () => {
    cy.get(".hdr-nav-link").contains("Browse Cars").click();
    cy.url().should("include", "/used-cars");
    cy.wait("@getCars");
  });

  it("navigates to /login from Log in button", () => {
    cy.get(".hdr-btn--ghost").click();
    cy.url().should("include", "/login");
  });

  it("navigates to /signup from Sign up button", () => {
    cy.get(".hdr-btn--primary").click();
    cy.url().should("include", "/signup");
  });

  it("renders footer with all column headings", () => {
    cy.get(".footer").scrollIntoView().should("be.visible");
    cy.get(".footer-column-title").should("contain.text", "Buy");
    cy.get(".footer-column-title").should("contain.text", "Sell");
    cy.get(".footer-column-title").should("contain.text", "Company");
    cy.get(".footer-column-title").should("contain.text", "Legal");
  });

  it("footer legal links navigate correctly", () => {
    cy.get(".footer").scrollIntoView();
    cy.contains("a", "Terms of Service").click();
    cy.url().should("include", "/terms");
  });

  it("footer About Us link navigates correctly", () => {
    cy.get(".footer").scrollIntoView();
    cy.contains("a", "About Us").click();
    cy.url().should("include", "/about");
  });

  it("footer Contact link navigates correctly", () => {
    cy.get(".footer").scrollIntoView();
    cy.contains("a", "Contact").click();
    cy.url().should("include", "/contact");
  });

  it("opens mobile drawer when hamburger is clicked", () => {
    cy.viewport(375, 667);
    cy.get(".hdr-hamburger").click();
    cy.get(".hdr-drawer--open").should("be.visible");
    cy.get(".hdr-drawer-link").should("have.length.greaterThan", 1);
  });

  it("closes mobile drawer when close button is clicked", () => {
    cy.viewport(375, 667);
    cy.get(".hdr-hamburger").click();
    cy.get(".hdr-drawer--open").should("be.visible");
    cy.get(".hdr-drawer-close").click();
    cy.get(".hdr-drawer--open").should("not.exist");
  });

  it("shows header user menu when authenticated as customer", () => {
    cy.fixture("customer-user.json").then((user) => {
      localStorage.setItem("accessToken", "fake-token");
      localStorage.setItem("user", JSON.stringify(user));
    });
    cy.visit("/");
    cy.get(".hdr-user-btn").should("be.visible");
    cy.get(".hdr-btn--ghost").should("not.exist");
  });
});
