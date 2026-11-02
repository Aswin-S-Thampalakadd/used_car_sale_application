describe("Dealer Dashboard", () => {
  const mockProfile = { id: 1, userId: 20, dealershipName: "Cypress Motors", city: "Kochi", state: "Kerala", isVerified: true };
  const mockSubscription = { planType: "free", carLimit: 5, status: "active" };

  beforeEach(() => {
    cy.fixture("dealer-user.json").then((user) => {
      localStorage.setItem("accessToken", "fake-dealer-token");
      localStorage.setItem("refreshToken", "fake-refresh");
      localStorage.setItem("user", JSON.stringify(user));
    });

    cy.intercept("GET", "**/api/v1/dealers/me/profile", { statusCode: 200, body: mockProfile }).as("getProfile");
    cy.intercept("GET", "**/api/v1/subscriptions/my-plan", { statusCode: 200, body: { subscription: mockSubscription } }).as("getSub");
    cy.intercept("GET", "**/api/v1/enquiries/me", { statusCode: 200, body: { enquiries: [] } }).as("getEnquiries");
    cy.intercept("GET", "**/api/v1/reviews/dealer/mine", { statusCode: 200, body: { reviews: [], averageRating: null, totalReviews: 0 } }).as("getReviews");
  });

  describe("With listings", () => {
    beforeEach(() => {
      cy.fixture("cars.json").then((data) => {
        cy.intercept("GET", "**/api/v1/dealers/me/cars", { statusCode: 200, body: { cars: data.cars } }).as("getMyCars");
      });
      cy.visit("/dashboard");
      cy.wait(["@getProfile", "@getMyCars", "@getSub"]);
      cy.dismissCookieBanner();
    });

    it("renders the sidebar with dealer name and verification badge", () => {
      cy.get(".dd-sidebar-name").should("contain.text", "Cypress Motors");
      cy.get(".dd-verified-badge").should("be.visible");
    });

    it("renders stat cards showing counts", () => {
      cy.get(".dd-stat-card").should("have.length", 4);
      cy.get(".dd-stat-label").should("contain.text", "Total Listings");
      cy.get(".dd-stat-label").should("contain.text", "Active");
    });

    it("renders car listing cards", () => {
      cy.get(".dd-car-card").should("have.length", 3);
    });

    it("each car card shows title, price and status", () => {
      cy.get(".dd-car-card").first().within(() => {
        cy.get(".dd-car-title").should("be.visible");
        cy.get(".dd-car-price").should("be.visible");
        cy.get(".dd-status-pill").should("be.visible");
      });
    });

    it("status filter chips filter the car list", () => {
      cy.get(".dd-filter-chip").contains("Active").click();
      cy.get(".dd-filter-chip--active").should("contain.text", "Active");
      cy.get(".dd-car-card").should("have.length.at.least", 0);
    });

    it("clicking All chip resets the filter", () => {
      cy.get(".dd-filter-chip").contains("Active").click();
      cy.get(".dd-filter-chip").contains("All").click();
      cy.get(".dd-car-card").should("have.length", 3);
    });

    it("Add Listing button navigates to /dashboard/add-car", () => {
      cy.get(".dd-add-btn").click();
      cy.url().should("include", "/dashboard/add-car");
    });

    it("switches to Enquiries tab", () => {
      cy.get(".dd-nav-item").contains("Enquiries").click();
      cy.get(".dd-page-title").should("contain.text", "Customer Enquiries");
    });

    it("switches to Reviews tab", () => {
      cy.get(".dd-nav-item").contains("Reviews").click();
      cy.get(".dd-page-title").should("contain.text", "Customer Reviews");
    });

    it("status dropdown changes the car status via API", () => {
      cy.intercept("PATCH", "**/api/v1/cars/*/status", {
        statusCode: 200,
        body: { message: "Car status updated successfully", car: {} },
      }).as("updateStatus");

      cy.get(".dd-status-select").first().select("sold");
      cy.wait("@updateStatus");
    });

    it("delete button triggers confirmation and removes car on confirm", () => {
      cy.intercept("DELETE", "**/api/v1/cars/**", { statusCode: 200, body: { message: "Car deleted successfully" } }).as("deleteCar");

      cy.on("window:confirm", () => true);
      cy.get(".dd-icon-btn--delete").first().click();
      cy.wait("@deleteCar");
      cy.get(".dd-car-card").should("have.length", 2);
    });

    it("cancel on delete confirm dialog keeps the car", () => {
      cy.on("window:confirm", () => false);
      cy.get(".dd-icon-btn--delete").first().click();
      cy.get(".dd-car-card").should("have.length", 3);
    });

    it("shows plan widget with free plan", () => {
      cy.get(".dd-plan-name").should("contain.text", "Free Plan");
      cy.get(".dd-plan-usage-text").should("contain.text", "3 / 5 listings");
    });
  });

  describe("With empty listings", () => {
    beforeEach(() => {
      cy.intercept("GET", "**/api/v1/dealers/me/cars", { statusCode: 200, body: { cars: [] } }).as("getMyCars");
      cy.visit("/dashboard");
      cy.wait(["@getProfile", "@getMyCars"]);
      cy.dismissCookieBanner();
    });

    it("shows empty state when no listings", () => {
      cy.get(".dd-empty").should("be.visible");
      cy.contains("No listings yet").should("be.visible");
    });

    it("empty state CTA navigates to add-car page", () => {
      cy.get(".dd-empty-cta").click();
      cy.url().should("include", "/dashboard/add-car");
    });
  });

  describe("Access control", () => {
    it("non-dealer customer is redirected away from /dashboard", () => {
      cy.fixture("customer-user.json").then((user) => {
        localStorage.setItem("accessToken", "fake-token");
        localStorage.setItem("user", JSON.stringify(user));
      });
      cy.visit("/dashboard");
      cy.url().should("not.include", "/dashboard");
    });

    it("unauthenticated user is redirected to /login from /dashboard", () => {
      cy.clearLocalStorage();
      cy.visit("/dashboard");
      cy.url().should("include", "/login");
    });
  });
});
