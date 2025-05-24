import MealLog from "../models/mealLog.model.js";
import DailySummary from "../models/dailySummary.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new meal log
const createMealLog = asyncHandler(async (req, res) => {
  const { date, mealType, foods } = req.body;
  const userId = req.user._id;

  // Calculate totals
  const totals = foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fats: acc.fats + food.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const mealLog = await MealLog.create({
    userId,
    date,
    mealType,
    foods,
    ...totals,
  });

  // Update daily summary
  await updateDailySummary(userId, date);

  return res
    .status(201)
    .json(new ApiResponse(201, mealLog, "Meal log created successfully"));
});

// Get all meal logs for a user
const getMealLogs = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const mealLogs = await MealLog.find({ userId }).populate("foods.foodItem");
  return res
    .status(200)
    .json(new ApiResponse(200, mealLogs, "Meal logs retrieved successfully"));
});

// Get meal logs by date
const getMealLogsByDate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { date } = req.params;

  const mealLogs = await MealLog.find({
    userId,
    date: new Date(date),
  }).populate("foods.foodItem");

  return res
    .status(200)
    .json(new ApiResponse(200, mealLogs, "Meal logs retrieved successfully"));
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

// Update meal log
const updateMealLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { date, mealType, foods } = req.body;

  // Calculate new totals
  const totals = foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fats: acc.fats + food.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const mealLog = await MealLog.findOneAndUpdate(
    { _id: req.params.id, userId },
    {
      date,
      mealType,
      foods,
      ...totals,
    },
    { new: true }
  ).populate("foods.foodItem");

  if (!mealLog) {
    throw new ApiError(404, "Meal log not found");
  }

  // Update daily summary
  await updateDailySummary(userId, date);

  return res
    .status(200)
    .json(new ApiResponse(200, mealLog, "Meal log updated successfully"));
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
    date: new Date(date),
  });

  const totalCaloriesConsumed = mealLogs.reduce(
    (sum, log) => sum + log.totalCalories,
    0
  );

  // Get exercise logs for the same date
  const exerciseLogs = await ExerciseLog.find({
    userId,
    date: new Date(date),
  });

  const totalCaloriesBurned = exerciseLogs.reduce(
    (sum, log) => sum + log.totalCaloriesBurned,
    0
  );

  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;

  await DailySummary.findOneAndUpdate(
    { userId, date: new Date(date) },
    {
      caloriesConsumed: totalCaloriesConsumed,
      caloriesBurned: totalCaloriesBurned,
      netCalories,
    },
    { upsert: true, new: true }
  );
};

export {
  createMealLog,
  getMealLogs,
  getMealLogById,
  updateMealLog,
  deleteMealLog,
  getMealLogsByDate,
};
