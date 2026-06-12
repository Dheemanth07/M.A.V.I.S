import { evaluateTemperature } from "./evaluators/evaluateTemperature.js";
import { evaluateHeartRate } from "./evaluators/evaluateHeartRate.js";
import { evaluateBloodOxygen } from "./evaluators/evaluateBloodOxygen.js";
import { evaluateHumidity } from "./evaluators/evaluateHumidity.js";
import { evaluateBattery } from "./evaluators/evaluateBattery.js";
import { evaluateTHI } from "./evaluators/evaluateTHI.js";

import { calculateRiskScore } from "./aggregators/calculateRiskScore.js";
import { determineHealthStatus } from "./aggregators/determineHealthStatus.js";
import { mergeAlerts } from "./aggregators/mergeAlerts.js";

import { normalizeMetric } from "./utils/normalizeMetric.js";

export function evaluateHealth(payload = {}) {

  // Normalize all incoming metrics to ensure consistent evaluation
  const temp = normalizeMetric(payload.temperature);
  const hr = normalizeMetric(payload.heartRate);
  const spo2 = normalizeMetric(payload.oxygen);
  const hum = normalizeMetric(payload.humidity);
  const batt = normalizeMetric(payload.battery);
  const thiValue = normalizeMetric(payload.thi);

  // 1. Evaluate all individual metrics and store them in an object
  const evaluations = {
    temperature: temp === undefined ? null : evaluateTemperature(Number(temp)),
    heartRate: hr === undefined ? null : evaluateHeartRate(Number(hr)),
    oxygen: spo2 === undefined ? null : evaluateBloodOxygen(Number(spo2)),
    humidity: hum === undefined ? null : evaluateHumidity(Number(hum)),
    battery: batt === undefined ? null : evaluateBattery(Number(batt)),
    thi: thiValue === undefined ? null : evaluateTHI(Number(thiValue)),
  };

  // 2. Run the aggregators using the evaluated data
  const overallRiskScore = calculateRiskScore(evaluations);
  const overallHealthStatus = determineHealthStatus(overallRiskScore);
  const mergedAlerts = mergeAlerts(evaluations);

  // 3. Return the final comprehensive health report
  return {
    ...evaluations,
    overallRiskScore,
    overallHealthStatus,
    mergedAlerts,
  };
}