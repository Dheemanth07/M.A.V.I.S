import { batteryMatrix } from "../rules/battery.rules.js";
import { MetricEvaluator } from "./createEvaluator.js";

export class BatteryEvaluator extends MetricEvaluator {
    constructor() {
        super("battery", batteryMatrix);
    }
}

export const batteryEvaluatorInstance = new BatteryEvaluator();
export const evaluateBattery = (val) => batteryEvaluatorInstance.evaluate(val);
export default BatteryEvaluator;