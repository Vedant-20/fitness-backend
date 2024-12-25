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

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

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
  });

  const token = await generateToken(user._id);
  res.status(201).json({ message: "User created successfully", user, token });
});

const signinUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("-password");

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (await user.comparePassword(password)) {
    const token = await generateToken(user._id);
    res.status(200).json({ message: "Login successful", user, token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

export { signupUser, signinUser };
