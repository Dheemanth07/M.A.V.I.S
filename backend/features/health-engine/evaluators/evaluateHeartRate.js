import { heartRateMatrix } from "../rules/heartRate.rules.js";
import { createEvaluator } from "./createEvaluator.js";

export const evaluateHeartRate = createEvaluator("heartRate", heartRateMatrix);

