import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      message: {
        unique: "Email already exists",
      },
    },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    weight: { type: Number, required: true }, // in kilograms
    height: { type: Number, required: true }, // in centimeters
    isSubscribed: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    activityLevel: {
      type: String,
      enum: ["sedentary", "lightly active", "moderately active", "very active"],
      required: true,
    },
    goal: {
      type: String,
      enum: ["lose weight", "maintain weight", "gain weight"],
      required: true,
    },
    dailyCalorieTarget: { type: Number, required: true }, // Automatically calculated
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
