import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createDailySummary,
  getDailySummaryStatus,
} from "../controllers/dailySummary.controller.js";

const router = Router();

router.route("/getDailySummaryStatus").get(verifyJWT, getDailySummaryStatus);

router.route("/createDailySummary").post(verifyJWT, createDailySummary);

export default router;
