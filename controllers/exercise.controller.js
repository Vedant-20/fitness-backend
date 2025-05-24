import ExerciseLog from "../models/exerciseLog.model.js";
import DailySummary from "../models/dailySummary.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new exercise log
const createExerciseLog = asyncHandler(async (req, res) => {
  const { date, exercises } = req.body;
  const userId = req.user._id;

  // Calculate total calories burned
  const totalCaloriesBurned = exercises.reduce(
    (sum, exercise) => sum + exercise.caloriesBurned,
    0
  );

  const exerciseLog = await ExerciseLog.create({
    userId,
    date,
    exercises,
    totalCaloriesBurned,
  });

  // Update daily summary
  await updateDailySummary(userId, date);

  return res
    .status(201)
    .json(
      new ApiResponse(201, exerciseLog, "Exercise log created successfully")
    );
});

// Get all exercise logs for a user
const getExerciseLogs = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const exerciseLogs = await ExerciseLog.find({ userId });
  return res
    .status(200)
    .json(
      new ApiResponse(200, exerciseLogs, "Exercise logs retrieved successfully")
    );
});

// Get exercise logs by date
const getExerciseLogsByDate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { date } = req.params;

  const exerciseLogs = await ExerciseLog.find({
    userId,
    date: new Date(date),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, exerciseLogs, "Exercise logs retrieved successfully")
    );
});

// Get exercise log by ID
const getExerciseLogById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const exerciseLog = await ExerciseLog.findOne({
    _id: req.params.id,
    userId,
  });

  if (!exerciseLog) {
    throw new ApiError(404, "Exercise log not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, exerciseLog, "Exercise log retrieved successfully")
    );
});

// Update exercise log
const updateExerciseLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { date, exercises } = req.body;

  // Calculate new total calories burned
  const totalCaloriesBurned = exercises.reduce(
    (sum, exercise) => sum + exercise.caloriesBurned,
    0
  );

  const exerciseLog = await ExerciseLog.findOneAndUpdate(
    { _id: req.params.id, userId },
    {
      date,
      exercises,
      totalCaloriesBurned,
    },
    { new: true }
  );

  if (!exerciseLog) {
    throw new ApiError(404, "Exercise log not found");
  }

  // Update daily summary
  await updateDailySummary(userId, date);

  return res
    .status(200)
    .json(
      new ApiResponse(200, exerciseLog, "Exercise log updated successfully")
    );
});

// Delete exercise log
const deleteExerciseLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const exerciseLog = await ExerciseLog.findOneAndDelete({
    _id: req.params.id,
    userId,
  });

  if (!exerciseLog) {
    throw new ApiError(404, "Exercise log not found");
  }

  // Update daily summary
  await updateDailySummary(userId, exerciseLog.date);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Exercise log deleted successfully"));
});

// Helper function to update daily summary
const updateDailySummary = async (userId, date) => {
  const exerciseLogs = await ExerciseLog.find({
    userId,
    date: new Date(date),
  });

  const totalCaloriesBurned = exerciseLogs.reduce(
    (sum, log) => sum + log.totalCaloriesBurned,
    0
  );

  // Get meal logs for the same date
  const mealLogs = await MealLog.find({
    userId,
    date: new Date(date),
  });

  const totalCaloriesConsumed = mealLogs.reduce(
    (sum, log) => sum + log.totalCalories,
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
  createExerciseLog,
  getExerciseLogs,
  getExerciseLogById,
  updateExerciseLog,
  deleteExerciseLog,
  getExerciseLogsByDate,
};
