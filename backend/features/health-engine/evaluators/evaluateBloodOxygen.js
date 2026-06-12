import { oxygenMatrix } from "../rules/oxygen.rules.js";
import { createEvaluator } from "./createEvaluator.js";

// Alias for blood oxygen saturation (SpO2)
export const evaluateBloodOxygen = createEvaluator("oxygen", oxygenMatrix);

