describe("Static Pages", () => {
  const pages = [
    { path: "/about",   titleFragment: "About" },
    { path: "/contact", titleFragment: "Contact" },
    { path: "/help",    titleFragment: "Help" },
    { path: "/terms",   titleFragment: "Terms" },
    { path: "/privacy", titleFragment: "Privacy" },
    { path: "/cookies", titleFragment: "Cookie" },
    { path: "/blog",    titleFragment: "Blog" },
  ];

  pages.forEach(({ path, titleFragment }) => {
    it(`${path} renders without error and shows some content`, () => {
      cy.visit(path);
      cy.get("body").should("be.visible");
      cy.get("header").should("be.visible");
      cy.get("footer").should("be.visible");
      cy.get("main, .page-content, section, [class*='page'], [class*='container']")
        .first()
        .should("be.visible");
    });
  });

  it("/rate-us page renders without crashing", () => {
    cy.intercept("GET", "**/api/v1/reviews/app*", { statusCode: 200, body: { reviews: [] } });
    cy.visit("/rate-us");
    cy.get("body").should("be.visible");
  });

  it("404-equivalent — unknown routes fall through to app shell", () => {
    cy.visit("/this-route-does-not-exist-at-all", { failOnStatusCode: false });
    cy.get("header").should("be.visible");
  });
});
