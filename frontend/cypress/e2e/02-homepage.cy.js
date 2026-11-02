describe("Home Page", () => {
  beforeEach(() => {
    cy.stubAPIs();
    cy.visit("/");
    cy.dismissCookieBanner();
  });

  it("renders the page without crashing", () => {
    cy.get("body").should("be.visible");
    cy.title().should("not.be.empty");
  });

  it("renders header and footer", () => {
    cy.get("header").should("be.visible");
    cy.get("footer").should("be.visible");
  });

  it("newsletter subscription form is present in footer", () => {
    cy.get(".footer-newsletter-form").scrollIntoView().should("be.visible");
    cy.get(".footer-newsletter-input").should("have.attr", "type", "email");
    cy.get(".footer-newsletter-btn").should("contain.text", "Subscribe");
  });

  it("newsletter shows error for invalid email", () => {
    cy.intercept("POST", "**/api/v1/newsletter/subscribe", {
      statusCode: 400,
      body: { success: false, message: "Invalid email address." },
    }).as("badSub");

    cy.get(".footer-newsletter-input").scrollIntoView().type("notvalid");
    cy.get(".footer-newsletter-btn").click();
    cy.wait("@badSub");
    cy.get(".footer-newsletter-error").should("be.visible");
  });

  it("newsletter shows success message on valid subscribe", () => {
    cy.intercept("POST", "**/api/v1/newsletter/subscribe", {
      statusCode: 200,
      body: { message: "Check your inbox to confirm!" },
    }).as("goodSub");

    cy.get(".footer-newsletter-input").scrollIntoView().type("test@example.com");
    cy.get(".footer-newsletter-btn").click();
    cy.wait("@goodSub");
    cy.get(".footer-newsletter-success").should("be.visible");
    cy.get(".footer-newsletter-input").should("have.value", "");
  });
});
