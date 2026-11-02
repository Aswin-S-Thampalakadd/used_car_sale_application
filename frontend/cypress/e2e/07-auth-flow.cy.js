describe("Auth Flow — protected routes and session", () => {
  beforeEach(() => {
    cy.stubAPIs();
  });

  describe("Unauthenticated redirects", () => {
    it("redirects /favourites to /login when not authenticated", () => {
      cy.visit("/favourites");
      cy.url().should("include", "/login");
    });

    it("redirects /enquiries to /login when not authenticated", () => {
      cy.visit("/enquiries");
      cy.url().should("include", "/login");
    });

    it("redirects /dashboard to /login when not authenticated", () => {
      cy.visit("/dashboard");
      cy.url().should("include", "/login");
    });

    it("redirects /admin to /admin/login when not authenticated", () => {
      cy.visit("/admin/dashboard");
      cy.url().should("include", "/admin/login");
    });
  });

  describe("Customer authentication state", () => {
    beforeEach(() => {
      cy.fixture("customer-user.json").then((user) => {
        localStorage.setItem("accessToken", "fake-customer-token");
        localStorage.setItem("refreshToken", "fake-refresh");
        localStorage.setItem("user", JSON.stringify(user));
      });
    });

    it("shows user avatar in header when authenticated", () => {
      cy.visit("/");
      cy.dismissCookieBanner();
      cy.get(".hdr-user-btn").should("be.visible");
      cy.get(".hdr-avatar").should("be.visible");
    });

    it("opens dropdown with name and role when avatar is clicked", () => {
      cy.visit("/");
      cy.dismissCookieBanner();
      cy.get(".hdr-user-btn").click();
      cy.get(".hdr-dropdown").should("be.visible");
      cy.get(".hdr-dropdown-name").should("contain.text", "Cypress Customer");
      cy.get(".hdr-dropdown-role").should("contain.text", "Customer Account");
    });

    it("shows Sign out in dropdown", () => {
      cy.visit("/");
      cy.dismissCookieBanner();
      cy.get(".hdr-user-btn").click();
      cy.get(".hdr-dropdown-item--danger").should("contain.text", "Sign out");
    });

    it("customer is redirected away from /dashboard", () => {
      cy.visit("/dashboard");
      cy.url().should("not.include", "/dashboard");
    });

    it("customer can access /favourites", () => {
      cy.intercept("GET", "**/api/v1/favourites", { statusCode: 200, body: { cars: [] } });
      cy.visit("/favourites");
      cy.url().should("include", "/favourites");
      cy.get(".fav-title").should("be.visible");
    });

    it("customer can access /enquiries", () => {
      cy.intercept("GET", "**/api/v1/enquiries/me", { statusCode: 200, body: { enquiries: [] } });
      cy.visit("/enquiries");
      cy.url().should("include", "/enquiries");
    });
  });

  describe("Dealer authentication state", () => {
    beforeEach(() => {
      cy.fixture("dealer-user.json").then((user) => {
        localStorage.setItem("accessToken", "fake-dealer-token");
        localStorage.setItem("refreshToken", "fake-refresh");
        localStorage.setItem("user", JSON.stringify(user));
      });

      cy.intercept("GET", "**/api/v1/dealers/me/profile", { statusCode: 200, body: { id: 1, dealershipName: "Cypress Motors", city: "Kochi", isVerified: true } });
      cy.intercept("GET", "**/api/v1/dealers/me/cars", { statusCode: 200, body: { cars: [] } });
      cy.intercept("GET", "**/api/v1/subscriptions/my-plan", { statusCode: 200, body: { subscription: { planType: "free", carLimit: 5 } } });
      cy.intercept("GET", "**/api/v1/enquiries/me", { statusCode: 200, body: { enquiries: [] } });
    });

    it("dealer can access /dashboard", () => {
      cy.visit("/dashboard");
      cy.url().should("include", "/dashboard");
    });

    it("shows dealer account role in dropdown", () => {
      cy.visit("/dashboard");
      cy.get(".hdr-user-btn").click();
      cy.get(".hdr-dropdown-role").should("contain.text", "Dealer Account");
    });

    it("dropdown shows Dashboard link for dealer", () => {
      cy.visit("/dashboard");
      cy.get(".hdr-user-btn").click();
      cy.get(".hdr-dropdown-item").should("contain.text", "Dashboard");
    });
  });

  describe("Logout", () => {
    beforeEach(() => {
      cy.fixture("customer-user.json").then((user) => {
        localStorage.setItem("accessToken", "fake-token");
        localStorage.setItem("user", JSON.stringify(user));
      });
    });

    it("clears session and redirects to home on logout", () => {
      cy.intercept("POST", "**/api/v1/auth/logout", { statusCode: 200, body: { message: "Logout successful" } }).as("logout");
      cy.visit("/");
      cy.dismissCookieBanner();
      cy.get(".hdr-user-btn").click();
      cy.get(".hdr-dropdown-item--danger").click();
      cy.wait("@logout");
      cy.url().should("eq", Cypress.config("baseUrl") + "/");
      cy.get(".hdr-btn--ghost").should("contain.text", "Log in");
    });
  });
});
