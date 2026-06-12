import { humidityMatrix } from "../rules/humidity.rules.js";
import { createEvaluator } from "./createEvaluator.js";

export const evaluateHumidity = createEvaluator("humidity", humidityMatrix);

