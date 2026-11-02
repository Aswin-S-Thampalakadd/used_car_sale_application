describe("Car Details Page", () => {
  const carSlug = "toyota-corolla-vxi-1";

  beforeEach(() => {
    cy.intercept("GET", `**/api/v1/cars/${carSlug}`, { fixture: "car-detail.json" }).as("getCarDetail");
    cy.intercept("GET", "**/api/v1/reviews/car/**", {
      statusCode: 200,
      body: { reviews: [], averageRating: null, totalReviews: 0 },
    }).as("getReviews");
    cy.visit(`/used-cars/${carSlug}`);
    cy.wait("@getCarDetail");
    cy.dismissCookieBanner();
  });

  it("renders the car title with year, make and model", () => {
    cy.get(".car-title").should("contain.text", "2020 Toyota Corolla");
  });

  it("renders the car price", () => {
    cy.get(".car-price").should("be.visible");
    cy.get(".car-price").invoke("text").should("match", /₹/);
  });

  it("renders quick specs: km, year, fuel, transmission", () => {
    cy.get(".car-quick-specs").should("be.visible");
    cy.get(".car-quick-spec").should("have.length", 4);
  });

  it("renders the negotiable badge", () => {
    cy.get(".car-negotiable").should("contain.text", "Negotiable");
  });

  it("renders Contact Dealer button", () => {
    cy.get(".car-btn-primary").should("contain.text", "Contact Dealer");
  });

  it("renders Save button", () => {
    cy.get(".car-btn-secondary").should("exist");
  });

  it("renders breadcrumb navigation", () => {
    cy.get(".car-breadcrumb").should("contain.text", "Home");
    cy.get(".car-breadcrumb").should("contain.text", "Used Cars");
    cy.get(".car-breadcrumb").should("contain.text", "2020 Toyota Corolla");
  });

  it("renders Overview section with spec grid", () => {
    cy.get(".car-section-title").first().should("contain.text", "Overview");
    cy.get(".car-spec-grid").should("be.visible");
    cy.get(".car-spec").should("have.length.greaterThan", 0);
  });

  it("renders car features section", () => {
    cy.get(".car-features").should("be.visible");
    cy.get(".car-feature").should("have.length.greaterThan", 0);
    cy.get(".car-feature").first().should("contain.text", "Air Conditioning");
  });

  it("renders dealer info card", () => {
    cy.get(".car-dealer-card").should("be.visible");
    cy.get(".car-dealer-name").should("contain.text", "Best Motors");
  });

  it("clicking Contact Dealer redirects unauthenticated user to login", () => {
    cy.get(".car-btn-primary").click();
    cy.url().should("include", "/login");
  });

  it("clicking Save redirects unauthenticated user to login", () => {
    cy.get(".car-btn-secondary").click();
    cy.url().should("include", "/login");
  });

  it("renders the enquiry form when Contact Dealer is clicked by authenticated user", () => {
    cy.fixture("customer-user.json").then((user) => {
      localStorage.setItem("accessToken", "fake-token");
      localStorage.setItem("user", JSON.stringify(user));
    });
    cy.reload();
    cy.wait("@getCarDetail");
    cy.get(".car-btn-primary").click();
    cy.get(".car-enquiry-form").should("be.visible");
    cy.get("#enq-msg").should("be.visible");
    cy.get(".car-enquiry-submit").should("contain.text", "Send Enquiry");
  });

  it("submits an enquiry successfully", () => {
    cy.fixture("customer-user.json").then((user) => {
      localStorage.setItem("accessToken", "fake-token");
      localStorage.setItem("user", JSON.stringify(user));
    });
    cy.intercept("POST", "**/api/v1/enquiries", {
      statusCode: 201,
      body: { message: "Enquiry sent successfully", enquiry: { id: 1 } },
    }).as("createEnquiry");

    cy.reload();
    cy.wait("@getCarDetail");
    cy.get(".car-btn-primary").click();
    cy.get("#enq-msg").type("I am interested in this car.");
    cy.get(".car-enquiry-submit").click();
    cy.wait("@createEnquiry");
    cy.get(".car-enquiry-success").should("contain.text", "Enquiry sent");
  });

  it("shows error when enquiry submission fails", () => {
    cy.fixture("customer-user.json").then((user) => {
      localStorage.setItem("accessToken", "fake-token");
      localStorage.setItem("user", JSON.stringify(user));
    });
    cy.intercept("POST", "**/api/v1/enquiries", {
      statusCode: 400,
      body: { success: false, message: "Car is not available for enquiry" },
    }).as("failEnquiry");

    cy.reload();
    cy.wait("@getCarDetail");
    cy.get(".car-btn-primary").click();
    cy.get(".car-enquiry-submit").click();
    cy.wait("@failEnquiry");
    cy.get(".car-enquiry-error").should("be.visible");
  });

  it("toggles favourite state when Save is clicked by authenticated user", () => {
    cy.fixture("customer-user.json").then((user) => {
      localStorage.setItem("accessToken", "fake-token");
      localStorage.setItem("user", JSON.stringify(user));
    });
    cy.intercept("GET", "**/api/v1/favourites/*/check", {
      statusCode: 200,
      body: { isFavourite: false },
    });
    cy.intercept("POST", "**/api/v1/favourites/**", {
      statusCode: 201,
      body: { message: "Added to favourites" },
    }).as("addFav");

    cy.reload();
    cy.wait("@getCarDetail");
    cy.get(".car-btn-secondary").click();
    cy.wait("@addFav");
    cy.get(".car-btn-saved").should("exist");
  });

  it("share button copies link and shows Copied confirmation", () => {
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, "writeText").resolves();
    });
    cy.get(".car-share-btn").click();
    cy.get(".car-share-btn").should("contain.text", "Copied!");
  });

  it("renders the car image gallery", () => {
    cy.get(".car-gallery-main").should("be.visible");
    cy.get(".car-gallery-main img").should("have.attr", "src").and("not.be.empty");
  });

  it("renders Safety card", () => {
    cy.get(".car-safety-card").should("be.visible");
    cy.contains("Buy with confidence").should("be.visible");
  });
});
