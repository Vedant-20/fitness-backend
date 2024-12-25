import mongoose from "mongoose";

const DailySummarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    caloriesConsumed: { type: Number, required: true },
    caloriesBurned: { type: Number, required: true },
    netCalories: { type: Number, required: true }, // caloriesConsumed - caloriesBurned
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("DailySummary", DailySummarySchema);
