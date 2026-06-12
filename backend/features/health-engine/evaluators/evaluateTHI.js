import { thiMatrix } from "../rules/thi.rules.js";
import { createEvaluator } from "./createEvaluator.js";

export const evaluateTHI = createEvaluator("thi", thiMatrix);

