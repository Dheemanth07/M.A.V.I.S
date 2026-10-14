import { heartRateMatrix } from "../rules/heartRate.rules.js";
import { MetricEvaluator } from "./createEvaluator.js";

export class HeartRateEvaluator extends MetricEvaluator {
    constructor() {
        super("heartRate", heartRateMatrix);
    }
}

export const heartRateEvaluatorInstance = new HeartRateEvaluator();
export const evaluateHeartRate = (val) => heartRateEvaluatorInstance.evaluate(val);
export default HeartRateEvaluator;
