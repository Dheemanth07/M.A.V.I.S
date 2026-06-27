import express from "express";
import { getAIInsight } from "./ai.controller.js";

const router = express.Router();

router.get("/:animalId", getAIInsight);

export default router;
