import FoodItem from "../models/foodItem.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { v2 as cloudinary } from "cloudinary";

// Create a new food item
const createFoodItem = asyncHandler(async (req, res) => {
  const { name, calories, protein, carbs, fats, servingSize } = req.body;
  let { foodPicture } = req.body;
  if (foodPicture) {
    const uploadedResponse = await cloudinary.uploader.upload(foodPicture);
    foodPicture = uploadedResponse.secure_url;
  }

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
    .json({ data: foodItem, message: "Food item created successfully" });
});

// Get all food items
const getFoodItems = asyncHandler(async (req, res) => {
  const foodItems = await FoodItem.find();
  return res
    .status(200)
    .json({ data: foodItems, message: "Food items retrieved successfully" });
});

// Get food item by ID
const getFoodItemById = asyncHandler(async (req, res) => {
  const foodItem = await FoodItem.findById(req.params.id);
  if (!foodItem) {
    return res.status(404).json({ message: "Food item not found" });
  }
  return res
    .status(200)
    .json({ data: foodItem, message: "Food item retrieved successfully" });
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
    return res.status(404).json({ message: "Food item not found" });
  }

  return res
    .status(200)
    .json({ data: foodItem, message: "Food item updated successfully" });
});

// Delete food item
const deleteFoodItem = asyncHandler(async (req, res) => {
  const foodItem = await FoodItem.findByIdAndDelete(req.params.id);
  if (!foodItem) {
    return res.status(404).json({ message: "Food item not found" });
  }
  return res.status(200).json({ message: "Food item deleted successfully" });
});

// Search food items
const searchFoodItems = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const foodItems = await FoodItem.find({
    name: { $regex: query, $options: "i" },
  });
  return res.status(200).json({ data: foodItems, message: "Food items found" });
});

export {
  createFoodItem,
  getFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
  searchFoodItems,
};
