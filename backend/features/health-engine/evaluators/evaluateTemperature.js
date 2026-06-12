import { temperatureMatrix } from "../rules/temperature.rules.js";
import { createEvaluator } from "./createEvaluator.js";

// evaluator instance (factory -> function)
export const evaluateTemperature = createEvaluator("temperature", temperatureMatrix);


