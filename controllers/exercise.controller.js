import Exercise from "../models/exercise.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { v2 as cloudinary } from "cloudinary";

// Create Exercise
const createExercise = asyncHandler(async (req, res) => {
  const { name, duration, caloriesBurned } = req.body;
  let { exercisePicture } = req.body;
  if (!name || !caloriesBurned) {
    return res
      .status(400)
      .json({ message: "Name and calories burned are required" });
  }
  if (exercisePicture) {
    const uploadedResponse = await cloudinary.uploader.upload(exercisePicture);
    exercisePicture = uploadedResponse.secure_url;
  }
  const exercise = await Exercise.create({
    name,
    duration,
    caloriesBurned,
    exercisePicture,
  });
  return res.status(201).json({ message: "Exercise created", data: exercise });
});

// Get All Exercises
const getAllExercises = asyncHandler(async (req, res) => {
  const exercises = await Exercise.find();
  return res.status(200).json({ data: exercises });
});

// Get Single Exercise by ID
const getExerciseById = asyncHandler(async (req, res) => {
  const exercise = await Exercise.findById(req.params.id);
  if (!exercise) {
    return res.status(404).json({ message: "Exercise not found" });
  }
  return res
    .status(200)
    .json({ data: exercise, message: "Exercise retrieved successfully" });
});

// Update Exercise
const updateExercise = asyncHandler(async (req, res) => {
  const { name, duration, caloriesBurned } = req.body;
  const exercise = await Exercise.findByIdAndUpdate(
    req.params.id,
    { name, duration, caloriesBurned },
    { new: true, runValidators: true }
  );
  if (!exercise) {
    return res.status(404).json({ message: "Exercise not found" });
  }
  return res.status(200).json({ message: "Exercise updated", data: exercise });
});

// Delete Exercise
const deleteExercise = asyncHandler(async (req, res) => {
  const exercise = await Exercise.findByIdAndDelete(req.params.id);
  if (!exercise) {
    return res.status(404).json({ message: "Exercise not found" });
  }
  return res.status(200).json({ message: "Exercise deleted" });
});

const searchExercisItems = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const exerciseItems = await Exercise.find({
    name: { $regex: query, $options: "i" },
  });
  return res
    .status(200)
    .json({ data: exerciseItems, message: "Exercise items found" });
});

export {
  createExercise,
  getAllExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
  searchExercisItems,
};
