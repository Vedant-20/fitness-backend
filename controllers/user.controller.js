import { asyncHandler } from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

const signupUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    age,
    gender,
    weight,
    height,
    activityLevel,
    goal,
  } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "Email already exists" });
  }

  // Calculate BMR (Mifflin-St Jeor Equation)
  let bmr;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === "female") {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    // For "other", use average of male and female
    bmr = 10 * weight + 6.25 * height - 5 * age - 78;
  }

  // Activity factor
  let activityFactor = 1.2;
  if (activityLevel === "lightly active") activityFactor = 1.375;
  else if (activityLevel === "moderately active") activityFactor = 1.55;
  else if (activityLevel === "very active") activityFactor = 1.725;

  let dailyCalorieTarget = Math.round(bmr * activityFactor);

  // Adjust for goal
  if (goal === "lose weight") dailyCalorieTarget -= 500;
  else if (goal === "gain weight") dailyCalorieTarget += 500;
  // For "maintain weight", no change

  // Ensure calorie target is not negative
  dailyCalorieTarget = Math.max(dailyCalorieTarget, 1200);

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    age,
    gender,
    weight,
    height,
    activityLevel,
    goal,
    dailyCalorieTarget,
  });

  const token = await generateToken(user._id);
  res.status(201).json({ message: "User created successfully", user, token });
});

const signinUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Select password explicitly for comparison
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Compare password in controller using bcrypt
  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    // Remove password from user object before sending response
    user.password = undefined;
    const token = await generateToken(user._id);
    res.status(200).json({ message: "Login successful", user, token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { name, age, gender, weight, height, activityLevel, goal } = req.body;
  const user = await User.findById(req.user._id);
  user.name = name;
  user.age = age;
  user.gender = gender;
  user.weight = weight;
  user.height = height;
  user.activityLevel = activityLevel;
  user.goal = goal;
  await user.save();
  res.status(200).json({ message: "User details updated successfully", user });
});

export { signupUser, signinUser, updateUserDetails };
