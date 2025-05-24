import DailySummary from "../models/dailySummary.model.js";
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
  res.status(201).json({ message: "Daily summary created successfully" });
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
  const existingDailySummary = await DailySummary.findOne({
    userId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });
  if (existingDailySummary) {
    return res.status(200).json({ dailySummaryCreated: true });
  }
  return res.status(400).json({ dailySummaryCreated: false });
});

export { createDailySummary, getDailySummaryStatus };
