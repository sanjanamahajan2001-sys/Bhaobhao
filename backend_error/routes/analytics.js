import express from "express";
import AnalyticsController from "../controllers/analytics.js";
import { requireAuthAdmin } from '../middlewares/requireAuthAdmin.js';
import { requireAuthGroomer } from '../middlewares/requireAuthGroomer.js';

const router = express.Router();

router.get("/dashboardCounters", requireAuthAdmin, AnalyticsController.dashboardCounters);
router.get("/dashboardCountersGroomer", requireAuthGroomer, AnalyticsController.dashboardCountersGroomer);

export default router;
