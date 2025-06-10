import mongoose from "mongoose";

const ExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    exercisePicture: {
      type: String,
      required: false,
    },
    duration: {
      type: Number,
      default: 5, // default duration is 5 minutes
    },
    caloriesBurned: {
      type: Number,
      required: true, // user will enter calories burned for 5 minutes
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Exercise", ExerciseSchema);
