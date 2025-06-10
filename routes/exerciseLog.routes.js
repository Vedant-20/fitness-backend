import { Router } from "express";
import {
  upsertExerciseLog,
  getExerciseLogByDate,
  removeExerciseFromLog,
} from "../controllers/exerciseLog.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All exercise log routes require authentication

// Add or update today's exercise log
router.route("/").post(upsertExerciseLog);

// Get today's exercise log
router.route("/today").get(getExerciseLogByDate);

// Remove an exercise from today's log by exerciseId
router.route("/:id").delete(removeExerciseFromLog);

export default router;
