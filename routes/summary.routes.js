import { Router } from "express";
import {
  getDailySummary,
  getWeeklySummary,
  getMonthlySummary,
  getSummaryByDateRange,
} from "../controllers/summary.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All summary routes require authentication

router.route("/daily/:date").get(getDailySummary);

router.route("/weekly").get(getWeeklySummary);

router.route("/monthly").get(getMonthlySummary);

router.route("/range").get(getSummaryByDateRange);

export default router;
