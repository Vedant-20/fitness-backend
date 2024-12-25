import mongoose from "mongoose";

const ExerciseLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    exercises: [
      {
        name: { type: String, required: true }, // e.g., "Running"
        duration: { type: Number, required: true }, // in minutes
        caloriesBurned: { type: Number, required: true }, // Total calories burned
      },
    ],
    totalCaloriesBurned: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ExerciseLog", ExerciseLogSchema);
