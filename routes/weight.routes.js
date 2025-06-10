import { Router } from "express";
import {
  addWeightEntry,
  getAllWeightEntries,
  getWeightEntryById,
  updateWeightEntry,
  deleteWeightEntry,
} from "../controllers/weightTracker.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All weight routes require authentication

// Add a new weight entry or get all weight entries
router.route("/").post(addWeightEntry).get(getAllWeightEntries);

// Get, update, or delete a single weight entry by ID
router
  .route("/:id")
  .get(getWeightEntryById)
  .put(updateWeightEntry)
  .delete(deleteWeightEntry);

export default router;
