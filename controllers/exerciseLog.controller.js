import ExerciseLog from "../models/exerciseLog.model.js";
import Exercise from "../models/exercise.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper to get today's date at 00:00:00
const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Create or update today's exercise log for user
const upsertExerciseLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = getToday();
  const { exerciseId, duration } = req.body;

  if (!exerciseId || !duration) {
    return res.status(400).json({
      message: "exerciseId and duration are required",
    });
  }

  // Fetch exercise details
  const exercise = await Exercise.findById(exerciseId);
  if (!exercise) {
    return res.status(404).json({ message: "Exercise not found" });
  }

  // Calculate calories burned based on duration
  // caloriesBurned is for exercise.duration (default 5 min), so scale accordingly
  const caloriesBurned = Math.round(
    (exercise.caloriesBurned / exercise.duration) * duration
  );

  // Find today's exercise log
  let exerciseLog = await ExerciseLog.findOne({ userId, date: today });

  if (!exerciseLog) {
    // Create new exercise log
    exerciseLog = await ExerciseLog.create({
      userId,
      date: today,
      exercises: [
        {
          exerciseId,
          duration,
          caloriesBurned,
        },
      ],
      totalCaloriesBurned: caloriesBurned,
    });
  } else {
    // Check if exercise already exists for today (optional: update or add new)
    // Here, we just add a new exercise entry
    exerciseLog.exercises.push({
      exerciseId,
      duration,
      caloriesBurned,
    });

    // Recalculate total calories burned
    exerciseLog.totalCaloriesBurned = exerciseLog.exercises.reduce(
      (sum, ex) => sum + ex.caloriesBurned,
      0
    );

    await exerciseLog.save();
  }

  await exerciseLog.populate("exercises.exerciseId");

  return res
    .status(201)
    .json({ data: exerciseLog, message: "Exercise log upserted successfully" });
});

const getExerciseLogByDate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = getToday();

  const exerciseLog = await ExerciseLog.findOne({
    userId,
    date: today,
  }).populate("exercises.exerciseId");

  if (!exerciseLog) {
    return res.status(404).json({
      message: "No exercise log found for today",
    });
  }

  return res.status(200).json({
    data: exerciseLog,
    message: "Today's exercise log retrieved successfully",
  });
});

const removeExerciseFromLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = getToday();
  const { id } = req.params; // id is exerciseId

  if (!id) {
    return res
      .status(400)
      .json({ message: "exerciseId is required in params" });
  }

  // Find today's exercise log
  let exerciseLog = await ExerciseLog.findOne({ userId, date: today });

  if (!exerciseLog) {
    return res.status(404).json({ message: "No exercise log found for today" });
  }

  // Remove the exercise from exercises array
  const initialExercisesLength = exerciseLog.exercises.length;
  exerciseLog.exercises = exerciseLog.exercises.filter(
    (ex) => ex.exerciseId.toString() !== id
  );

  if (exerciseLog.exercises.length === initialExercisesLength) {
    return res
      .status(404)
      .json({ message: "Exercise not found in today's exercise log" });
  }

  // Recalculate total calories burned
  exerciseLog.totalCaloriesBurned = exerciseLog.exercises.reduce(
    (sum, ex) => sum + ex.caloriesBurned,
    0
  );

  await exerciseLog.save();
  await exerciseLog.populate("exercises.exerciseId");

  return res.status(200).json({
    data: exerciseLog,
    message: "Exercise removed and exercise log updated successfully",
  });
});

export { upsertExerciseLog, getExerciseLogByDate, removeExerciseFromLog };
