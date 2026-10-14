import { oxygenMatrix } from "../rules/oxygen.rules.js";
import { MetricEvaluator } from "./createEvaluator.js";

export class BloodOxygenEvaluator extends MetricEvaluator {
    constructor() {
        super("oxygen", oxygenMatrix);
    }
}

export const bloodOxygenEvaluatorInstance = new BloodOxygenEvaluator();
export const evaluateBloodOxygen = (val) => bloodOxygenEvaluatorInstance.evaluate(val);
export default BloodOxygenEvaluator;
