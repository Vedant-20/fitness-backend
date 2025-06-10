import { Router } from "express";
import {
  signupUser,
  signinUser,
  updateUserDetails,
  getUserProfile,
  HealthCheck,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/signup").post(signupUser);
router.route("/signin").post(signinUser);
router.route("/updateUser").put(verifyJWT, updateUserDetails);
router.route("/profile").get(verifyJWT, getUserProfile);
router.route("/health-check").get(HealthCheck);

export default router;
