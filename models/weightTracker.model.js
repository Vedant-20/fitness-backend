import mongoose from "mongoose";

const WeightTrackerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    weight: { type: Number, required: true }, // in kilograms
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("WeightTracker", WeightTrackerSchema);
