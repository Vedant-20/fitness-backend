import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import connectDB from "./db/db.js";
import cors from "cors";
import job from "./cron/cron.js";

import userRoutes from "./routes/user.routes.js";
import foodRoutes from "./routes/food.routes.js";
import mealRoutes from "./routes/meal.routes.js";
import exerciseRoutes from "./routes/exercise.routes.js";
import weightRoutes from "./routes/weight.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import dailySummaryRoutes from "./routes/dailySummary.routes.js";
import exerciseLogRoutes from "./routes/exerciseLog.routes.js";

dotenv.config();
job.start(); // Start the cron job

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 5000;

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/foods", foodRoutes);
app.use("/api/v1/meals", mealRoutes);
app.use("/api/v1/exercises", exerciseRoutes);
app.use("/api/v1/weight", weightRoutes);
app.use("/api/v1/summary", summaryRoutes);
app.use("/api/v1/dailySummary", dailySummaryRoutes);
app.use("/api/v1/exerciseLogs", exerciseLogRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

export { app };
