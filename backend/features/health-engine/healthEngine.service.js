import { temperatureEvaluatorInstance } from "./evaluators/evaluateTemperature.js";
import { heartRateEvaluatorInstance } from "./evaluators/evaluateHeartRate.js";
import { bloodOxygenEvaluatorInstance } from "./evaluators/evaluateBloodOxygen.js";
import { humidityEvaluatorInstance } from "./evaluators/evaluateHumidity.js";
import { batteryEvaluatorInstance } from "./evaluators/evaluateBattery.js";
import { thiEvaluatorInstance } from "./evaluators/evaluateTHI.js";

import { riskScoreCalculator } from "./aggregators/calculateRiskScore.js";
import { healthStatusDeterminer } from "./aggregators/determineHealthStatus.js";
import { alertMerger } from "./aggregators/mergeAlerts.js";

import { normalizeMetric } from "./utils/normalizeMetric.js";

/**
 * Orchestrating Service for Multi-Modal Animal Vitality Intelligence.
 * Encapsulated as an Object-Oriented Service with Dependency Injection.
 */
export class HealthEngineService {
    #tempEval;
    #hrEval;
    #o2Eval;
    #humEval;
    #battEval;
    #thiEval;
    #riskCalc;
    #statusDeterminer;
    #alertMerger;

    constructor(dependencies = {}) {
        this.#tempEval = dependencies.temperatureEvaluator || temperatureEvaluatorInstance;
        this.#hrEval = dependencies.heartRateEvaluator || heartRateEvaluatorInstance;
        this.#o2Eval = dependencies.oxygenEvaluator || bloodOxygenEvaluatorInstance;
        this.#humEval = dependencies.humidityEvaluator || humidityEvaluatorInstance;
        this.#battEval = dependencies.batteryEvaluator || batteryEvaluatorInstance;
        this.#thiEval = dependencies.thiEvaluator || thiEvaluatorInstance;
        this.#riskCalc = dependencies.riskScoreCalculator || riskScoreCalculator;
        this.#statusDeterminer = dependencies.healthStatusDeterminer || healthStatusDeterminer;
        this.#alertMerger = dependencies.alertMerger || alertMerger;
    }

    /**
     * Executes comprehensive vital and multi-modal evaluation on an incoming sensor payload.
     * @param {Object} payload - Raw or mapped sensor telemetry payload
     * @returns {Object} Comprehensive clinical health report
     */
    evaluateHealth(payload = {}) {
        const temp = normalizeMetric(payload.temperature ?? payload.physiology?.temperature);
        const hr = normalizeMetric(payload.heartRate ?? payload.physiology?.heartRate);
        const spo2 = normalizeMetric(payload.oxygen ?? payload.bloodOxygen ?? payload.physiology?.bloodOxygen ?? payload.physiology?.oxygen);
        const hum = normalizeMetric(payload.humidity ?? payload.environment?.humidity);
        const batt = normalizeMetric(payload.battery ?? payload.batteryLevel ?? payload.device?.batteryLevel ?? payload.device?.battery);
        const thiValue = normalizeMetric(payload.thi ?? payload.environment?.thi);

        // 1. Evaluate individual physiological and environmental metrics
        const evaluations = {
            temperature: temp === undefined ? null : this.#tempEval.evaluate(Number(temp)),
            heartRate: hr === undefined ? null : this.#hrEval.evaluate(Number(hr)),
            oxygen: spo2 === undefined ? null : this.#o2Eval.evaluate(Number(spo2)),
            humidity: hum === undefined ? null : this.#humEval.evaluate(Number(hum)),
            battery: batt === undefined ? null : this.#battEval.evaluate(Number(batt)),
            thi: thiValue === undefined ? null : this.#thiEval.evaluate(Number(thiValue)),
        };

        const context = {
            motion: payload.motion ?? payload.behavior?.motion,
            lyingDown: payload.lyingDown ?? payload.behavior?.lyingDown,
            rumination: payload.rumination ?? payload.behavior?.rumination,
            headShaking: payload.headShaking ?? payload.behavior?.headShaking,
            sensorStatus: payload.sensorStatus ?? payload.device?.sensorStatus,
            thi: thiValue,
            herdRiskScore: payload.herdRiskScore
        };

        // 2. Aggregate composite risk score, health tier, and deduplicated alerts
        const overallRiskScore = this.#riskCalc.calculate(evaluations, context);
        const overallHealthStatus = this.#statusDeterminer.determine(overallRiskScore);
        const mergedAlerts = this.#alertMerger.merge(evaluations);

        return {
            ...evaluations,
            overallRiskScore,
            overallHealthStatus,
            mergedAlerts,
        };
    }
}

export const healthEngineService = new HealthEngineService();
export const evaluateHealth = (payload) => healthEngineService.evaluateHealth(payload);
export default HealthEngineService;