import express from "express";
import { scheduleEmail } from "../controllers/schedule.controller";

const router = express.Router();

/**
 * POST /api/schedule
 */
router.post("/", scheduleEmail);

export default router;