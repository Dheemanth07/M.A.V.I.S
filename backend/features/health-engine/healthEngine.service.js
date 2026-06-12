import { evaluateTemperature } from "./evaluators/evaluateTemperature.js";
import { evaluateHeartRate } from "./evaluators/evaluateHeartRate.js";
import { evaluateBloodOxygen } from "./evaluators/evaluateBloodOxygen.js";

import { evaluateHumidity } from "./evaluators/evaluateHumidity.js";
import { evaluateBattery } from "./evaluators/evaluateBattery.js";
import { evaluateTHI } from "./evaluators/evaluateTHI.js";

import { calculateRiskScore } from "./aggregators/calculateRiskScore.js";
import { determineHealthStatus } from "./aggregators/determineHealthStatus.js";
import { mergeAlerts } from "./aggregators/mergeAlerts.js";

export function evaluateHealth(payload = {}) {
  const {
    temperature,
    heartRate,
    oxygen,
    humidity,
    battery,
    thi,
  } = payload;

  const evaluations = {
    temperature: temperature === undefined ? null : evaluateTemperature(Number(temperature)),
    heartRate: heartRate === undefined ? null : evaluateHeartRate(Number(heartRate)),
    oxygen: oxygen === undefined ? null : evaluateBloodOxygen(Number(oxygen)),
    humidity: humidity === undefined ? null : evaluateHumidity(Number(humidity)),
    battery: battery === undefined ? null : evaluateBattery(Number(battery)),
    thi: thi === undefined ? null : evaluateTHI(Number(thi)),
  };

  const overallRiskScore = calculateRiskScore(evaluations);
  const overallHealthStatus = determineHealthStatus(overallRiskScore);
  const mergedAlerts = mergeAlerts(evaluations);

  return {
    ...evaluations,
    overallRiskScore,
    overallHealthStatus,
    mergedAlerts,
  };
}


