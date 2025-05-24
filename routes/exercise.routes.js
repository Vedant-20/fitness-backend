import { Router } from "express";
import {
  createExerciseLog,
  getExerciseLogs,
  getExerciseLogById,
  updateExerciseLog,
  deleteExerciseLog,
  getExerciseLogsByDate,
} from "../controllers/exercise.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All exercise routes require authentication

router.route("/").post(createExerciseLog).get(getExerciseLogs);

router.route("/date/:date").get(getExerciseLogsByDate);

router
  .route("/:id")
  .get(getExerciseLogById)
  .put(updateExerciseLog)
  .delete(deleteExerciseLog);

export default router;
