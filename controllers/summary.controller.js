import DailySummary from "../models/dailySummary.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get daily summary
const getDailySummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { date } = req.params;

  const summary = await DailySummary.findOne({
    userId,
    date: new Date(date),
  });

  if (!summary) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { message: "No summary found for this date" })
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, summary, "Daily summary retrieved successfully")
    );
});

// Get weekly summary
const getWeeklySummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const summaries = await DailySummary.find({
    userId,
    date: {
      $gte: startOfWeek,
      $lte: endOfWeek,
    },
  }).sort({ date: 1 });

  const weeklyStats = {
    totalCaloriesConsumed: summaries.reduce(
      (sum, day) => sum + day.caloriesConsumed,
      0
    ),
    totalCaloriesBurned: summaries.reduce(
      (sum, day) => sum + day.caloriesBurned,
      0
    ),
    averageNetCalories:
      summaries.reduce((sum, day) => sum + day.netCalories, 0) /
      summaries.length,
    dailySummaries: summaries,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, weeklyStats, "Weekly summary retrieved successfully")
    );
});

// Get monthly summary
const getMonthlySummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const summaries = await DailySummary.find({
    userId,
    date: {
      $gte: startOfMonth,
      $lte: endOfMonth,
    },
  }).sort({ date: 1 });

  const monthlyStats = {
    totalCaloriesConsumed: summaries.reduce(
      (sum, day) => sum + day.caloriesConsumed,
      0
    ),
    totalCaloriesBurned: summaries.reduce(
      (sum, day) => sum + day.caloriesBurned,
      0
    ),
    averageNetCalories:
      summaries.reduce((sum, day) => sum + day.netCalories, 0) /
      summaries.length,
    dailySummaries: summaries,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        monthlyStats,
        "Monthly summary retrieved successfully"
      )
    );
});

// Get summary by date range
const getSummaryByDateRange = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(400, "Start date and end date are required");
  }

  const summaries = await DailySummary.find({
    userId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  }).sort({ date: 1 });

  const rangeStats = {
    totalCaloriesConsumed: summaries.reduce(
      (sum, day) => sum + day.caloriesConsumed,
      0
    ),
    totalCaloriesBurned: summaries.reduce(
      (sum, day) => sum + day.caloriesBurned,
      0
    ),
    averageNetCalories:
      summaries.reduce((sum, day) => sum + day.netCalories, 0) /
      summaries.length,
    dailySummaries: summaries,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        rangeStats,
        "Date range summary retrieved successfully"
      )
    );
});

export {
  getDailySummary,
  getWeeklySummary,
  getMonthlySummary,
  getSummaryByDateRange,
};
