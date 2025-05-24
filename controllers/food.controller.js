import FoodItem from "../models/foodItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new food item
const createFoodItem = asyncHandler(async (req, res) => {
  const { name, foodPicture, calories, protein, carbs, fats, servingSize } =
    req.body;

  const foodItem = await FoodItem.create({
    name,
    foodPicture,
    calories,
    protein,
    carbs,
    fats,
    servingSize,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, foodItem, "Food item created successfully"));
});

// Get all food items
const getFoodItems = asyncHandler(async (req, res) => {
  const foodItems = await FoodItem.find();
  return res
    .status(200)
    .json(new ApiResponse(200, foodItems, "Food items retrieved successfully"));
});

// Get food item by ID
const getFoodItemById = asyncHandler(async (req, res) => {
  const foodItem = await FoodItem.findById(req.params.id);
  if (!foodItem) {
    throw new ApiError(404, "Food item not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, foodItem, "Food item retrieved successfully"));
});

// Update food item
const updateFoodItem = asyncHandler(async (req, res) => {
  const { name, foodPicture, calories, protein, carbs, fats, servingSize } =
    req.body;

  const foodItem = await FoodItem.findByIdAndUpdate(
    req.params.id,
    {
      name,
      foodPicture,
      calories,
      protein,
      carbs,
      fats,
      servingSize,
    },
    { new: true }
  );

  if (!foodItem) {
    throw new ApiError(404, "Food item not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, foodItem, "Food item updated successfully"));
});

// Delete food item
const deleteFoodItem = asyncHandler(async (req, res) => {
  const foodItem = await FoodItem.findByIdAndDelete(req.params.id);
  if (!foodItem) {
    throw new ApiError(404, "Food item not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Food item deleted successfully"));
});

// Search food items
const searchFoodItems = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const foodItems = await FoodItem.find({
    name: { $regex: query, $options: "i" },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, foodItems, "Food items search completed"));
});

export {
  createFoodItem,
  getFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
  searchFoodItems,
};
