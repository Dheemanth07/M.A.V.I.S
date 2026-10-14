import { temperatureMatrix } from "../rules/temperature.rules.js";
import { MetricEvaluator } from "./createEvaluator.js";

export class TemperatureEvaluator extends MetricEvaluator {
    constructor() {
        super("temperature", temperatureMatrix);
    }
}

export const temperatureEvaluatorInstance = new TemperatureEvaluator();
export const evaluateTemperature = (val) => temperatureEvaluatorInstance.evaluate(val);
export default TemperatureEvaluator;
