import { Router } from "express";
import {
  createMealLog,
  getMealLogs,
  getMealLogById,
  updateMealLog,
  deleteMealLog,
  getMealLogsByDate,
} from "../controllers/meal.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All meal routes require authentication

router.route("/").post(createMealLog).get(getMealLogs);

router.route("/date/:date").get(getMealLogsByDate);

router
  .route("/:id")
  .get(getMealLogById)
  .put(updateMealLog)
  .delete(deleteMealLog);

export default router;
