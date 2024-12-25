import mongoose from "mongoose";

const FoodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    calories: { type: Number, required: true }, // per 100g
    protein: { type: Number, required: true }, // in grams
    carbs: { type: Number, required: true }, // in grams
    fats: { type: Number, required: true }, // in grams
    servingSize: { type: String, default: "100g" }, // e.g., "1 slice", "100g"
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("FoodItem", FoodItemSchema);
