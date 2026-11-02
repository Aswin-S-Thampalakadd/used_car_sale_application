import express from "express";
import carRouter from "../../../src/modules/cars/car.routes.js";
import authRouter from "../../../src/modules/auth/auth.routes.js";
import enquiriesRouter from "../../../src/modules/enquiries/enquiries.routes.js";
import favouritesRouter from "../../../src/modules/favourites/favourites.routes.js";
import reviewsRouter from "../../../src/modules/reviews/reviews.routes.js";
import dealersRouter from "../../../src/modules/dealers/dealers.routes.js";
import carImagesRouter from "../../../src/modules/car-images/car-images.routes.js";
import usersRouter from "../../../src/modules/users/users.routes.js";
import subscriptionsRouter from "../../../src/modules/subscriptions/subscriptions.routes.js";
import uploadsRouter from "../../../src/modules/uploads/uploads.routes.js";
import statsRouter from "../../../src/modules/stats/stats.routes.js";
import adminRouter from "../../../src/modules/admin/admin.routes.js";
import notificationsRouter from "../../../src/modules/notifications/notifications.routes.js";
import newsletterRouter from "../../../src/modules/newsletter/newsletter.routes.js";
import { notFound, errorHandler } from "../../../src/middlewares/error.middleware.js";

export const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/cars", carRouter);
  app.use("/api/v1/cars", carImagesRouter);
  app.use("/api/v1/enquiries", enquiriesRouter);
  app.use("/api/v1/favourites", favouritesRouter);
  app.use("/api/v1/reviews", reviewsRouter);
  app.use("/api/v1/dealers", dealersRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/subscriptions", subscriptionsRouter);
  app.use("/api/v1/uploads", uploadsRouter);
  app.use("/api/v1/stats", statsRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/notifications", notificationsRouter);
  app.use("/api/v1/newsletter", newsletterRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
