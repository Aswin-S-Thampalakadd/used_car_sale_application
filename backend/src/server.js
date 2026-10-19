import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

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

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/cars", carRouter);
app.use("/api/v1/cars", carImagesRouter);   // image sub-routes on /cars/:carId/images
app.use("/api/v1/enquiries", enquiriesRouter);
app.use("/api/v1/favourites", favouritesRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/dealers", dealersRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/subscriptions", subscriptionsRouter);
app.use("/api/v1/uploads", uploadsRouter);
app.use("/api/v1/stats",         statsRouter);
app.use("/api/v1/admin",         adminRouter);
app.use("/api/v1/notifications", notificationsRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
