import { humidityMatrix } from "../rules/humidity.rules.js";
import { MetricEvaluator } from "./createEvaluator.js";

export class HumidityEvaluator extends MetricEvaluator {
    constructor() {
        super("humidity", humidityMatrix);
    }
}

export const humidityEvaluatorInstance = new HumidityEvaluator();
export const evaluateHumidity = (val) => humidityEvaluatorInstance.evaluate(val);
export default HumidityEvaluator;
