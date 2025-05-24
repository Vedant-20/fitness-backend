import FoodItem from "../models/foodItem.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { v2 as cloudinary } from "cloudinary";

const createFoodItem = asyncHandler(async (req, res) => {
  const { name, calories, protein, carbs, fats } = req.body;
  let { img } = req.body;

  if (img) {
    const uploadedResponse = await cloudinary.uploader.upload(img);
    img = uploadedResponse.secure_url;
  }
  const foodItem = await FoodItem.create({
    name,
    calories,
    protein,
    carbs,
    fats,
    foodPicture: img,
  });
  res.status(201).json({ message: "Food item created successfully", foodItem });
});

const updateFoodItem = asyncHandler(async (req, res) => {
  const { name, calories, protein, carbs, fats } = req.body;
  let { img } = req.body;

  if (img) {
    const uploadedResponse = await cloudinary.uploader.upload(img);
    img = uploadedResponse.secure_url;
  }
  const foodItem = await FoodItem.findById(req.params.id);
  foodItem.name = name;
  foodItem.calories = calories;
  foodItem.protein = protein;
  foodItem.carbs = carbs;
  foodItem.fats = fats;
  foodItem.foodPicture = img;
  await foodItem.save();
  res.status(200).json({ message: "Food item updated successfully", foodItem });
});

const deleteFoodItem = asyncHandler(async (req, res) => {
  const { foodId } = req.body;
  const foodItem = await FoodItem.findByIdAndDelete(foodId);
  res.status(200).json({ message: "Food item deleted successfully", foodItem });
});

export { createFoodItem, updateFoodItem, deleteFoodItem };
