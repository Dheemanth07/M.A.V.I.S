import { thiMatrix } from "../rules/thi.rules.js";
import { MetricEvaluator } from "./createEvaluator.js";

export class THIEvaluator extends MetricEvaluator {
    constructor() {
        super("thi", thiMatrix);
    }
}

export const thiEvaluatorInstance = new THIEvaluator();
export const evaluateTHI = (val) => thiEvaluatorInstance.evaluate(val);
export default THIEvaluator;
