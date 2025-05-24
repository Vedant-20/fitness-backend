import { Router } from "express";
import {
  createFoodItem,
  getFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
  searchFoodItems,
} from "../controllers/food.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/search").get(searchFoodItems);

// Protected routes
router.route("/").post(verifyJWT, createFoodItem).get(verifyJWT, getFoodItems);

router
  .route("/:id")
  .get(verifyJWT, getFoodItemById)
  .put(verifyJWT, updateFoodItem)
  .delete(verifyJWT, deleteFoodItem);

export default router;
