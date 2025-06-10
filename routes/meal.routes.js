import { Router } from "express";
import {
  upsertMealLog,
  getMealLogs,
  getMealLogById,
  updateMealLog,
  deleteMealLog,
  getMealLogsByDate,
  removeFoodItemFromMealLog,
} from "../controllers/meal.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All meal routes require authentication

// Add or update today's meal log
router.route("/").post(upsertMealLog).get(getMealLogs);

// Get today's meal log
router.route("/today").get(getMealLogsByDate);

// CRUD by ID
router
  .route("/:id")
  .get(getMealLogById)
  .put(updateMealLog)
  .delete(removeFoodItemFromMealLog);

export default router;
