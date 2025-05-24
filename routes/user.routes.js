import { Router } from "express";
import {
  signupUser,
  signinUser,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/signup").post(signupUser);
router.route("/signin").post(signinUser);
router.route("/updateUser").put(verifyJWT, updateUserDetails);

export default router;
