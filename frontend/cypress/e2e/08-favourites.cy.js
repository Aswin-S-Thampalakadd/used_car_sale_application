describe("Favourites Page", () => {
  beforeEach(() => {
    cy.fixture("customer-user.json").then((user) => {
      localStorage.setItem("accessToken", "fake-token");
      localStorage.setItem("user", JSON.stringify(user));
    });
    cy.stubAPIs();
  });

  it("redirects to login when not authenticated", () => {
    cy.clearLocalStorage();
    cy.visit("/favourites");
    cy.url().should("include", "/login");
  });

  it("renders empty state when no favourites", () => {
    cy.intercept("GET", "**/api/v1/favourites", { statusCode: 200, body: { cars: [] } }).as("getFavs");
    cy.visit("/favourites");
    cy.wait("@getFavs");
    cy.get(".fav-title").should("contain.text", "Saved Cars");
    cy.get(".fav-empty").should("be.visible");
    cy.contains("No saved cars yet").should("be.visible");
    cy.get(".fav-browse-btn").should("contain.text", "Browse Cars");
  });

  it("renders car cards when favourites exist", () => {
    cy.fixture("cars.json").then((data) => {
      cy.intercept("GET", "**/api/v1/favourites", { statusCode: 200, body: { cars: data.cars } }).as("getFavs");
    });
    cy.visit("/favourites");
    cy.wait("@getFavs");
    cy.get(".fav-card").should("have.length.greaterThan", 0);
    cy.get(".fav-card-title").first().should("be.visible");
  });

  it("each favourite card shows price and specs", () => {
    cy.fixture("cars.json").then((data) => {
      cy.intercept("GET", "**/api/v1/favourites", { statusCode: 200, body: { cars: data.cars } }).as("getFavs");
    });
    cy.visit("/favourites");
    cy.wait("@getFavs");
    cy.get(".fav-card").first().within(() => {
      cy.get(".fav-card-price").should("be.visible");
      cy.get(".fav-card-specs").should("be.visible");
    });
  });

  it("removes a car from favourites", () => {
    cy.fixture("cars.json").then((data) => {
      cy.intercept("GET", "**/api/v1/favourites", { statusCode: 200, body: { cars: data.cars } }).as("getFavs");
    });
    cy.intercept("DELETE", "**/api/v1/favourites/**", { statusCode: 200, body: { message: "Removed from favourites" } }).as("removeFav");

    cy.visit("/favourites");
    cy.wait("@getFavs");
    const initialCount = 3;
    cy.get(".fav-card").should("have.length", initialCount);
    cy.get(".fav-remove-btn").first().click();
    cy.wait("@removeFav");
    cy.get(".fav-card").should("have.length", initialCount - 1);
  });

  it("shows error when remove fails", () => {
    cy.fixture("cars.json").then((data) => {
      cy.intercept("GET", "**/api/v1/favourites", { statusCode: 200, body: { cars: data.cars } }).as("getFavs");
    });
    cy.intercept("DELETE", "**/api/v1/favourites/**", { statusCode: 500, body: { message: "Server error" } }).as("failRemove");

    cy.visit("/favourites");
    cy.wait("@getFavs");
    cy.get(".fav-remove-btn").first().click();
    cy.wait("@failRemove");
    cy.get(".fav-error").should("be.visible");
  });

  it("Browse Cars button navigates to /used-cars", () => {
    cy.intercept("GET", "**/api/v1/favourites", { statusCode: 200, body: { cars: [] } }).as("getFavs");
    cy.visit("/favourites");
    cy.wait("@getFavs");
    cy.get(".fav-browse-btn").click();
    cy.url().should("include", "/used-cars");
  });

  it("subtitle shows correct count", () => {
    cy.fixture("cars.json").then((data) => {
      cy.intercept("GET", "**/api/v1/favourites", { statusCode: 200, body: { cars: data.cars } }).as("getFavs");
    });
    cy.visit("/favourites");
    cy.wait("@getFavs");
    cy.get(".fav-subtitle").should("contain.text", "3 cars saved");
  });
});
