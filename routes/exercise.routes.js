import { Router } from "express";
import {
  createExercise,
  getAllExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
  searchExercisItems,
} from "../controllers/exercise.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All exercise routes require authentication

router.route("/").post(createExercise).get(getAllExercises);
router.route("/search").get(searchExercisItems);

router
  .route("/:id")
  .get(getExerciseById)
  .put(updateExercise)
  .delete(deleteExercise);

export default router;
