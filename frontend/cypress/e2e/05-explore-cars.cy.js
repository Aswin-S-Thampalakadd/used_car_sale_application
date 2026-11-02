describe("Explore Cars Page (/used-cars)", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/v1/cars/brands", { fixture: "brands.json" }).as("getBrands");
    cy.intercept("GET", "**/api/v1/cars*", { fixture: "cars.json" }).as("getCars");
    cy.intercept("GET", "**/api/v1/cars/search*", { fixture: "cars.json" }).as("searchCars");
    cy.visit("/used-cars");
    cy.wait("@getCars");
    cy.dismissCookieBanner();
  });

  it("renders the page title and car count", () => {
    cy.get(".explore-title").should("contain.text", "Explore Used Cars");
    cy.get(".explore-subtitle").should("be.visible");
  });

  it("displays car cards from the API", () => {
    cy.get(".car-card").should("have.length.greaterThan", 0);
  });

  it("each car card shows make, model, price and specs", () => {
    cy.get(".car-card").first().within(() => {
      cy.get(".car-card-title").should("be.visible");
      cy.get(".car-card-price").should("be.visible");
      cy.get(".car-card-specs").should("be.visible");
    });
  });

  it("featured badge appears on featured cars", () => {
    cy.get(".car-card-badge-featured").first().should("contain.text", "Featured");
  });

  it("negotiable badge appears on negotiable cars", () => {
    cy.get(".car-card-badge-negotiable").should("exist");
  });

  it("typing in the search box triggers a new API call", () => {
    cy.get('input[aria-label="Search cars"]').type("Toyota");
    cy.wait("@getCars");
    cy.get('input[aria-label="Search cars"]').should("have.value", "Toyota");
  });

  it("sort dropdown changes selected value", () => {
    cy.get("#sortBy").select("price-asc");
    cy.get("#sortBy").should("have.value", "price-asc");
    cy.wait("@getCars");
  });

  it("opens and closes the filter panel", () => {
    cy.get(".explore-filter-toggle").click();
    cy.get(".explore-filters.open").should("be.visible");
    cy.get(".explore-filters-close").click();
    cy.get(".explore-filters.open").should("not.exist");
  });

  it("fuel type filter chip toggles active state", () => {
    cy.get(".explore-filter-toggle").click();
    cy.get(".explore-chip").contains("petrol").click();
    cy.get(".explore-chip.active").should("contain.text", "petrol");
    cy.get(".explore-chip").contains("petrol").click();
    cy.get(".explore-chip").contains("petrol").should("not.have.class", "active");
  });

  it("transmission filter chip works", () => {
    cy.get(".explore-filter-toggle").click();
    cy.get(".explore-chip").contains("manual").click();
    cy.get(".explore-chip.active").should("contain.text", "manual");
  });

  it("price range inputs accept numeric values", () => {
    cy.get(".explore-filter-toggle").click();
    cy.get('input[aria-label="Minimum price"]').type("300000");
    cy.get('input[aria-label="Maximum price"]').type("900000");
    cy.get('input[aria-label="Minimum price"]').should("have.value", "300000");
    cy.get('input[aria-label="Maximum price"]').should("have.value", "900000");
  });

  it("Clear all filters button appears when filters are active", () => {
    cy.get(".explore-filter-toggle").click();
    cy.get(".explore-chip").contains("petrol").click();
    cy.get(".explore-filters-clear").should("be.visible");
    cy.get(".explore-filters-clear").click();
    cy.get(".explore-chip.active").should("not.exist");
  });

  it("clicking a car card navigates to the car detail page", () => {
    cy.intercept("GET", "**/api/v1/cars/**", { fixture: "car-detail.json" }).as("getCarDetail");
    cy.intercept("GET", "**/api/v1/reviews/car/**", { statusCode: 200, body: { reviews: [], averageRating: null, totalReviews: 0 } });
    cy.get(".car-card-link").first().click();
    cy.url().should("include", "/used-cars/");
  });

  it("shows empty state when no cars match filters", () => {
    cy.intercept("GET", "**/api/v1/cars*", { body: { cars: [], total: 0 } }).as("emptyCars");
    cy.get('input[aria-label="Search cars"]').type("xxxxxxxxxnotexist");
    cy.wait("@emptyCars");
    cy.get(".explore-empty").should("be.visible");
    cy.contains("No cars match your filters").should("be.visible");
  });

  it("shows error state when API fails", () => {
    cy.intercept("GET", "**/api/v1/cars*", { statusCode: 500, body: { message: "Server error" } }).as("failCars");
    cy.get('input[aria-label="Search cars"]').clear().type("error-trigger");
    cy.wait("@failCars");
    cy.get(".explore-error-state").should("be.visible");
    cy.contains("Something went wrong").should("be.visible");
  });
});
