import { Router } from "express";
import {
  createWeightEntry,
  getWeightHistory,
  getWeightEntryById,
  updateWeightEntry,
  deleteWeightEntry,
  getWeightStats,
} from "../controllers/weight.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All weight routes require authentication

router.route("/").post(createWeightEntry).get(getWeightHistory);

router.route("/stats").get(getWeightStats);

router
  .route("/:id")
  .get(getWeightEntryById)
  .put(updateWeightEntry)
  .delete(deleteWeightEntry);

export default router;
