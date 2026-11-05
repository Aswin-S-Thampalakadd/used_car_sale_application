import "./config/env.js";
import express from "express";
import cors from "cors";
import compression from "compression";
import logger from "./config/logger.js";
import { httpLogger } from "./middlewares/httpLogger.middleware.js";

import carRouter from "./modules/cars/car.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import enquiriesRouter from "./modules/enquiries/enquiries.routes.js";
import favouritesRouter from "./modules/favourites/favourites.routes.js";
import reviewsRouter from "./modules/reviews/reviews.routes.js";
import dealersRouter from "./modules/dealers/dealers.routes.js";
import carImagesRouter from "./modules/car-images/car-images.routes.js";
import usersRouter from "./modules/users/users.routes.js";
import subscriptionsRouter from "./modules/subscriptions/subscriptions.routes.js";
import uploadsRouter from "./modules/uploads/uploads.routes.js";
import statsRouter from "./modules/stats/stats.routes.js";
import adminRouter from "./modules/admin/admin.routes.js";
import notificationsRouter from "./modules/notifications/notifications.routes.js";
import newsletterRouter from "./modules/newsletter/newsletter.routes.js";
import operatorsRouter from "./modules/operators/operators.routes.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import { publicCacheHeaders } from "./middlewares/cache.middleware.js";

const app = express();
const port = process.env.PORT || 5000;
const env = process.env.NODE_ENV || "development";

const corsOptions =
  env === "production"
    ? {
        origin: (process.env.CORS_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean),
        credentials: true,
      }
    : { origin: true, credentials: true };

app.set("etag", "strong");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
}));
app.use(publicCacheHeaders);
app.use(httpLogger);

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
app.use("/api/v1/operators", operatorsRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server started`, { env, port });
});
