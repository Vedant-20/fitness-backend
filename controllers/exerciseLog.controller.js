import ExerciseLog from "../models/exerciseLog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createExerciseLog = asyncHandler(async (req, res) => {
  const { exercise, totalCaloriesBurned } = req.body;
  const exerciseLog = await ExerciseLog.create({
    userId: req.user._id,
    date: new Date(),

    totalCaloriesBurned,
  });

  if (exerciseLog) {
    const addExercise = await ExerciseLog.findByIdAndUpdate(exerciseLog._id, {
      $push: { exercises: exercise },
    });
    return res
      .status(201)
      .json({ message: "Exercise log created successfully" });
  } else {
    return res.status(400).json({ message: "Failed to create exercise log" });
  }
});

const getExerciseLogStatus = asyncHandler(async (req, res) => {
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

  const existingExerciseLog = await ExerciseLog.findOne({
    userId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  if (existingExerciseLog) {
    return res.status(200).json({ exerciseEntered: true });
  }

  return res.status(400).json({ exerciseEntered: false });
});

const addExerciseToLog = asyncHandler(async (req, res) => {
  const { exerciseLogId, exercise } = req.body;
  const exerciseLog = await ExerciseLog.findById(exerciseLogId);

  if (!exerciseLog) {
    return res.status(404).json({ message: "Exercise log not found" });
  }

  exerciseLog.exercises.push(exercise);
  await exerciseLog.save();

  return res
    .status(200)
    .json({ message: "Exercise added to log successfully" });
});

export { createExerciseLog, getExerciseLogStatus, addExerciseToLog };
