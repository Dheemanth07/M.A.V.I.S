import { batteryMatrix } from "../rules/battery.rules.js";
import { createEvaluator } from "./createEvaluator.js";

export const evaluateBattery = createEvaluator("battery", batteryMatrix);

