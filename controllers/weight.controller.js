import WeightTracker from "../models/weightTracker.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new weight entry
const createWeightEntry = asyncHandler(async (req, res) => {
  const { date, weight } = req.body;
  const userId = req.user._id;

  const weightEntry = await WeightTracker.create({
    userId,
    date,
    weight,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, weightEntry, "Weight entry created successfully")
    );
});

// Get weight history for a user
const getWeightHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const weightHistory = await WeightTracker.find({ userId }).sort({ date: -1 });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        weightHistory,
        "Weight history retrieved successfully"
      )
    );
});

// Get weight entry by ID
const getWeightEntryById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const weightEntry = await WeightTracker.findOne({
    _id: req.params.id,
    userId,
  });

  if (!weightEntry) {
    throw new ApiError(404, "Weight entry not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, weightEntry, "Weight entry retrieved successfully")
    );
});

// Update weight entry
const updateWeightEntry = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { date, weight } = req.body;

  const weightEntry = await WeightTracker.findOneAndUpdate(
    { _id: req.params.id, userId },
    {
      date,
      weight,
    },
    { new: true }
  );

  if (!weightEntry) {
    throw new ApiError(404, "Weight entry not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, weightEntry, "Weight entry updated successfully")
    );
});

// Delete weight entry
const deleteWeightEntry = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const weightEntry = await WeightTracker.findOneAndDelete({
    _id: req.params.id,
    userId,
  });

  if (!weightEntry) {
    throw new ApiError(404, "Weight entry not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Weight entry deleted successfully"));
});

// Get weight statistics
const getWeightStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate } = req.query;

  const query = { userId };
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const weightEntries = await WeightTracker.find(query).sort({ date: 1 });

  if (weightEntries.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, { message: "No weight entries found" }));
  }

  const stats = {
    currentWeight: weightEntries[weightEntries.length - 1].weight,
    startingWeight: weightEntries[0].weight,
    weightChange:
      weightEntries[weightEntries.length - 1].weight - weightEntries[0].weight,
    averageWeight:
      weightEntries.reduce((sum, entry) => sum + entry.weight, 0) /
      weightEntries.length,
    highestWeight: Math.max(...weightEntries.map((entry) => entry.weight)),
    lowestWeight: Math.min(...weightEntries.map((entry) => entry.weight)),
    entries: weightEntries,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, "Weight statistics retrieved successfully")
    );
});

export {
  createWeightEntry,
  getWeightHistory,
  getWeightEntryById,
  updateWeightEntry,
  deleteWeightEntry,
  getWeightStats,
};
