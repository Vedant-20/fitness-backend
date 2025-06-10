import MealLog from "../models/mealLog.model.js";
import FoodItem from "../models/foodItem.model.js";
import DailySummary from "../models/dailySummary.model.js";
import ExerciseLog from "../models/exerciseLog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper to get today's date at 00:00:00
const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Helper to calculate macros for foods array [{ foodItem, quantity }]
const calculateMacros = async (foodsInput) => {
  let foods = [];
  let totalCalories = 0,
    totalProtein = 0,
    totalCarbs = 0,
    totalFats = 0;

  for (const food of foodsInput) {
    const foodItem = await FoodItem.findById(food.foodItemId);
    if (!foodItem) throw new ApiError(404, "Food item not found");

    // Assume foodItem.calories, protein, carbs, fats are per 100g
    const factor = food.quantity / 100;
    const calories = Math.round(foodItem.calories * factor);
    const protein = +(foodItem.protein * factor).toFixed(2);
    const carbs = +(foodItem.carbs * factor).toFixed(2);
    const fats = +(foodItem.fats * factor).toFixed(2);

    foods.push({
      foodItem: food.foodItemId,
      quantity: food.quantity,
      calories,
      protein,
      carbs,
      fats,
    });

    totalCalories += calories;
    totalProtein += protein;
    totalCarbs += carbs;
    totalFats += fats;
  }

  return { foods, totalCalories, totalProtein, totalCarbs, totalFats };
};

// Create or update today's meal log for user
const upsertMealLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = getToday();
  const { foodItemId, quantity } = req.body;

  if (!foodItemId || !quantity) {
    return res.status(400).json({
      message: "foodItemId and quantity are required",
    });
  }

  const foodItem = await FoodItem.findById(foodItemId);
  if (!foodItem)
    return res.status(404).json({
      message: "Food item not found",
    });

  // Calculate macros for this food item
  const factor = quantity / 100;
  const calories = Math.round(foodItem.calories * factor);
  const protein = +(foodItem.protein * factor).toFixed(2);
  const carbs = +(foodItem.carbs * factor).toFixed(2);
  const fats = +(foodItem.fats * factor).toFixed(2);

  // Find today's meal log
  let mealLog = await MealLog.findOne({ userId, date: today });

  if (!mealLog) {
    // Create new meal log
    mealLog = await MealLog.create({
      userId,
      date: today,
      foods: [
        {
          foodItem: foodItemId,
          quantity,
          calories,
          protein,
          carbs,
          fats,
        },
      ],
      totalCalories: calories,
      totalProtein: protein,
      totalCarbs: carbs,
      totalFats: fats,
    });
  } else {
    // Check if food item already exists in foods array
    const existingFood = mealLog.foods.find(
      (f) => f.foodItem.toString() === foodItemId
    );
    if (existingFood) {
      // Update quantity and macros
      existingFood.quantity += quantity;
      const newFactor = existingFood.quantity / 100;
      existingFood.calories = Math.round(foodItem.calories * newFactor);
      existingFood.protein = +(foodItem.protein * newFactor).toFixed(2);
      existingFood.carbs = +(foodItem.carbs * newFactor).toFixed(2);
      existingFood.fats = +(foodItem.fats * newFactor).toFixed(2);
    } else {
      // Add new food item
      mealLog.foods.push({
        foodItem: foodItemId,
        quantity,
        calories,
        protein,
        carbs,
        fats,
      });
    }

    // Recalculate totals
    mealLog.totalCalories = mealLog.foods.reduce(
      (sum, f) => sum + f.calories,
      0
    );
    mealLog.totalProtein = mealLog.foods.reduce((sum, f) => sum + f.protein, 0);
    mealLog.totalCarbs = mealLog.foods.reduce((sum, f) => sum + f.carbs, 0);
    mealLog.totalFats = mealLog.foods.reduce((sum, f) => sum + f.fats, 0);

    await mealLog.save();
  }

  await mealLog.populate("foods.foodItem");

  // Update daily summary
  await updateDailySummary(userId, today);

  return res
    .status(201)
    .json({ data: mealLog, message: "Meal log upserted successfully" });
});

// Get all meal logs for a user
const getMealLogs = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const mealLogs = await MealLog.find({ userId }).populate("foods.foodItem");
  return res
    .status(200)
    .json({ data: mealLogs, message: "Meal logs retrieved successfully" });
});

// Get meal logs for today
const getMealLogsByDate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = getToday();

  const mealLog = await MealLog.findOne({
    userId,
    date: today,
  }).populate("foods.foodItem");

  if (!mealLog) {
    return res.status(404).json({
      message: "No meal log found for today",
    });
  }

  return res.status(200).json({
    data: mealLog,
    message: "Today's meal log retrieved successfully",
  });
});

// Get meal log by ID
const getMealLogById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const mealLog = await MealLog.findOne({
    _id: req.params.id,
    userId,
  }).populate("foods.foodItem");

  if (!mealLog) {
    throw new ApiError(404, "Meal log not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, mealLog, "Meal log retrieved successfully"));
});

// Update meal log by ID (replaces foods)
const updateMealLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { foods: foodsInput } = req.body;

  if (!foodsInput || !Array.isArray(foodsInput) || foodsInput.length === 0) {
    throw new ApiError(400, "Foods array is required");
  }

  const { foods, totalCalories, totalProtein, totalCarbs, totalFats } =
    await calculateMacros(foodsInput);

  const mealLog = await MealLog.findOneAndUpdate(
    { _id: req.params.id, userId },
    {
      foods,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
    },
    { new: true }
  ).populate("foods.foodItem");

  if (!mealLog) {
    return res.status(404).json({ message: "Meal log not found" });
  }

  // Update daily summary
  await updateDailySummary(userId, mealLog.date);

  return res
    .status(200)
    .json({ data: mealLog, message: "Meal log updated successfully" });
});

// Delete meal log
const deleteMealLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const mealLog = await MealLog.findOneAndDelete({
    _id: req.params.id,
    userId,
  });

  if (!mealLog) {
    throw new ApiError(404, "Meal log not found");
  }

  // Update daily summary
  await updateDailySummary(userId, mealLog.date);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Meal log deleted successfully"));
});

// Helper function to update daily summary
const updateDailySummary = async (userId, date) => {
  const mealLogs = await MealLog.find({
    userId,
    date: date,
  });

  const totalCaloriesConsumed = mealLogs.reduce(
    (sum, log) => sum + log.totalCalories,
    0
  );

  // Get exercise logs for the same date
  const exerciseLogs = await ExerciseLog.find({
    userId,
    date: date,
  });

  const totalCaloriesBurned = exerciseLogs.reduce(
    (sum, log) => sum + log.totalCaloriesBurned,
    0
  );

  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;

  await DailySummary.findOneAndUpdate(
    { userId, date: date },
    {
      caloriesConsumed: totalCaloriesConsumed,
      caloriesBurned: totalCaloriesBurned,
      netCalories,
    },
    { upsert: true, new: true }
  );
};

const removeFoodItemFromMealLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = getToday();
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ message: "foodItemId is required in params" });
  }

  // Find today's meal log
  let mealLog = await MealLog.findOne({ userId, date: today });

  if (!mealLog) {
    return res.status(404).json({ message: "No meal log found for today" });
  }

  // Remove the food item from foods array
  const initialFoodsLength = mealLog.foods.length;
  mealLog.foods = mealLog.foods.filter((f) => f.foodItem.toString() !== id);

  if (mealLog.foods.length === initialFoodsLength) {
    return res
      .status(404)
      .json({ message: "Food item not found in today's meal log" });
  }

  // Recalculate totals
  mealLog.totalCalories = mealLog.foods.reduce((sum, f) => sum + f.calories, 0);
  mealLog.totalProtein = mealLog.foods.reduce((sum, f) => sum + f.protein, 0);
  mealLog.totalCarbs = mealLog.foods.reduce((sum, f) => sum + f.carbs, 0);
  mealLog.totalFats = mealLog.foods.reduce((sum, f) => sum + f.fats, 0);

  await mealLog.save();
  await mealLog.populate("foods.foodItem");

  // Update daily summary
  await updateDailySummary(userId, today);

  return res.status(200).json({
    data: mealLog,
    message: "Food item removed and meal log updated successfully",
  });
});

export {
  upsertMealLog,
  getMealLogs,
  getMealLogById,
  updateMealLog,
  deleteMealLog,
  getMealLogsByDate,
  removeFoodItemFromMealLog,
};
