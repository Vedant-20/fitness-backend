import { asyncHandler } from "../utils/asyncHandler.js";
import WeightTracker from "../models/weightTracker.model.js";
import User from "../models/user.model.js";

const enterWeight = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const existingWeightEntry = await WeightTracker.findOne({
    userId,
    date: {
      $gte: new Date(currentYear, currentMonth, 1),
      $lte: new Date(currentYear, currentMonth + 1, 0),
    },
  });

  if (existingWeightEntry) {
    return res
      .status(400)
      .json({ message: "You have already entered your weight for this month" });
  }

  const weight = req.body.weight;
  const weightTracker = new WeightTracker({ userId, weight, date: new Date() });
  await weightTracker.save();

  res.status(201).json({ message: "Weight entered successfully" });
});

const getWeightEntryStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const existingWeightEntry = await WeightTracker.findOne({
    userId,
    date: {
      $gte: new Date(currentYear, currentMonth, 1),
      $lte: new Date(currentYear, currentMonth + 1, 0),
    },
  });

  if (existingWeightEntry) {
    return res.status(200).json({ weightEntered: true });
  }

  return res.status(400).json({ weightEntered: false });
});
