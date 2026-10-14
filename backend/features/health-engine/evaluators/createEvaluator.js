/**
 * @file Object-Oriented Metric Evaluator Base Class & Factory
 */

export class MetricEvaluator {
    #metric;
    #matrix;

    /**
     * @param {string} metric - Metric identifier (e.g. "temperature", "heartRate")
     * @param {Array<Object>} [matrix=[]] - Decision rules matrix
     */
    constructor(metric, matrix = []) {
        this.#metric = metric;
        this.#matrix = matrix;
    }

    get metric() {
        return this.#metric;
    }

    get matrix() {
        return this.#matrix;
    }

    /**
     * Evaluates a numeric metric value against the decision rule matrix.
     * @param {number} value
     * @returns {Object} Evaluation report
     */
    evaluate(value) {
        const matchedRule = this.#matrix.find(rule => {
            if (typeof rule.check === "function") {
                return rule.check(value);
            }
            if (Array.isArray(rule.range) && rule.range.length === 2) {
                return value >= rule.range[0] && value <= rule.range[1];
            }
            return false;
        });

        if (!matchedRule) {
            return {
                metric: this.#metric,
                value,
                state: "Unknown",
                severity: "none",
                riskContribution: 0,
                alerts: [],
                recommendation: "No rule matched",
            };
        }

        const alerts = matchedRule.severity !== "none"
            ? [{
                type: matchedRule.alertType,
                severity: matchedRule.severity,
                message: `${matchedRule.state} detected`,
                value,
            }]
            : [];

        return {
            metric: this.#metric,
            value,
            state: matchedRule.state,
            severity: matchedRule.severity,
            riskContribution: matchedRule.riskContribution,
            alerts,
            recommendation: matchedRule.recommendation,
        };
    }
}

/**
 * Functional factory adapter for backward-compatibility.
 * @param {string} metric
 * @param {Array<Object>} matrix
 * @returns {(value: number) => Object}
 */
export function createEvaluator(metric, matrix) {
    const evaluator = new MetricEvaluator(metric, matrix);
    return (value) => evaluator.evaluate(value);
}

export default MetricEvaluator;
