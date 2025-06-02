import DailySummary from "../models/dailySummary.model.js";
import MealLog from "../models/mealLog.model.js";
import ExerciseLog from "../models/exerciseLog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createDailySummary = asyncHandler(async (req, res) => {
  const { caloriesConsumed, caloriesBurned } = req.body;
  const dailySummary = await DailySummary.create({
    userId: req.user._id,
    date: new Date(),
    caloriesConsumed: 0,
    caloriesBurned: 0,
    netCalories: caloriesConsumed - caloriesBurned,
  });
  res
    .status(201)
    .json({ message: "Daily summary created successfully", dailySummary });
});

const getDailySummaryStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const currentDate = new Date();
  const startOfDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    23,
    59,
    59,
    999
  );

  // 1. Daily Summary
  const existingDailySummary = await DailySummary.findOne({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  // 2. Meal Logs & Macros
  const mealLogs = await MealLog.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  let totalCalories = 0,
    totalProtein = 0,
    totalCarbs = 0,
    totalFats = 0;
  mealLogs.forEach((log) => {
    totalCalories += log.totalCalories;
    totalProtein += log.totalProtein;
    totalCarbs += log.totalCarbs;
    totalFats += log.totalFats;
  });

  // 3. Exercise Logs
  const exerciseLogs = await ExerciseLog.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  let totalExercises = 0,
    totalExerciseCaloriesBurned = 0;
  exerciseLogs.forEach((log) => {
    totalExercises += log.exercises.length;
    totalExerciseCaloriesBurned += log.totalCaloriesBurned;
  });

  // 4. Respond with all details
  return res.status(200).json({
    dailySummaryCreated: !!existingDailySummary,
    dailySummary: existingDailySummary,
    macros: {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
    },
    exercise: {
      totalExercises,
      totalExerciseCaloriesBurned,
      exerciseLogs,
    },
    mealLogs,
  });
});

export { createDailySummary, getDailySummaryStatus };
