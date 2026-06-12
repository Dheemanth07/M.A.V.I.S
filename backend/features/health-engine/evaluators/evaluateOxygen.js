import { oxygenMatrix } from "../rules/oxygen.rules.js";
import { createEvaluator } from "./createEvaluator.js";

// Backward-compatible export (previous file name)
export const evaluateOxygen = createEvaluator("oxygen", oxygenMatrix);

