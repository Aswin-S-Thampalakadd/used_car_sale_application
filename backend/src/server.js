import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import carRouter from "./modules/cars/car.routes.js";
import authController from "./modules/auth/auth.routes.js";

const app = express();

const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
dotenv.config();

// Routes configuration
app.use("/api/v1/cars", carRouter);
app.use("/api/v1/auth", authController);

app.get("/health", (req, res) => {
  res.send("Nodejs server is running");
});

app.listen(port, () => {
  console.log(`Server is running at the port ${port}`);
});
