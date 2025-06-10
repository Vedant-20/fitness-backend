import { asyncHandler } from "../utils/asyncHandler.js";
import WeightTracker from "../models/weightTracker.model.js";

// Create or add a new weight entry
const addWeightEntry = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { weight } = req.body;
  const date = req.body.date ? new Date(req.body.date) : new Date();

  if (!weight) {
    return res.status(400).json({ message: "Weight is required" });
  }

  const weightEntry = await WeightTracker.create({
    userId,
    date,
    weight,
  });

  res.status(201).json({ message: "Weight entry added", data: weightEntry });
});

// Get all weight entries for the user
const getAllWeightEntries = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const entries = await WeightTracker.find({ userId }).sort({ date: -1 });
  res.status(200).json({ data: entries });
});

// Get a single weight entry by ID
const getWeightEntryById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const entry = await WeightTracker.findOne({ _id: id, userId });
  if (!entry) {
    return res.status(404).json({ message: "Weight entry not found" });
  }
  res.status(200).json({ data: entry });
});

// Update a weight entry by ID
const updateWeightEntry = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { weight, date } = req.body;

  const entry = await WeightTracker.findOneAndUpdate(
    { _id: id, userId },
    { weight, date: date ? new Date(date) : undefined },
    { new: true, runValidators: true }
  );

  if (!entry) {
    return res.status(404).json({ message: "Weight entry not found" });
  }

  res.status(200).json({ message: "Weight entry updated", data: entry });
});

// Delete a weight entry by ID
const deleteWeightEntry = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const entry = await WeightTracker.findOneAndDelete({ _id: id, userId });
  if (!entry) {
    return res.status(404).json({ message: "Weight entry not found" });
  }
  res.status(200).json({ message: "Weight entry deleted" });
});

export {
  addWeightEntry,
  getAllWeightEntries,
  getWeightEntryById,
  updateWeightEntry,
  deleteWeightEntry,
};
