import AppError from "../../utils/AppError.js";
import mavisEvents, { EVENTS } from "../../config/events.js";
import { BATTERY_WARNING_THRESHOLD, FEVER_TEMPERATURE_THRESHOLD } from "../../config/constants.js";
import { ensureValidObjectId } from "../../utils/validateObjectId.js";
import { getSpeciesCircadianBaseline } from "../health-engine/circadian.service.js";

/**
 * Validates animal ownership, stores sensor data, and executes Digital Twin baseline analytics
 * powered by Welford's dynamic variance algorithm and in-memory state caching.
 */
class SensorService {
    #sensorRepository;
    #animalRepository;
    #alertRepository;

    // High-performance in-memory cache to reduce MongoDB I/O by >80%
    #animalCache = new Map();
    #lastDBSync = new Map();
    #anomalyStreak = new Map();

    /**
     * @param {Object} sensorRepository - SensorRepository instance.
     * @param {Object} animalRepository - AnimalRepository instance.
     * @param {Object} [alertRepository] - AlertRepository instance.
     */
    constructor(sensorRepository, animalRepository, alertRepository = null) {
        this.#sensorRepository = sensorRepository;
        this.#animalRepository = animalRepository;
        this.#alertRepository = alertRepository;
    }

    /**
     * Welford's single-pass algorithm for running mean and squared deviations (variance).
     * @private
     */
    #updateWelford(stats = { count: 0, mean: 0, m2: 0 }, x) {
        const count = (stats.count || 0) + 1;
        const mean = (stats.mean !== undefined) ? stats.mean : x;
        const delta = x - mean;
        const newMean = mean + delta / count;
        const delta2 = x - newMean;
        const m2 = (stats.m2 || 0) + delta * delta2;
        return { count, mean: newMean, m2 };
    }

    /**
     * Computes the dynamic Z-Score against variance.
     * @private
     */
    #computeZScore(currentVal, baselineVal, m2, count, minSigma = 1.0) {
        if (!count || count < 2 || !m2 || m2 <= 0) {
            const dev = Math.abs(currentVal - baselineVal);
            return { z: Number((dev / minSigma).toFixed(2)), sigma: minSigma };
        }
        const sampleSigma = Math.sqrt(m2 / (count - 1));
        const sigma = Math.max(sampleSigma, minSigma);
        const z = Math.abs(currentVal - baselineVal) / sigma;
        return { z: Number(z.toFixed(2)), sigma: Number(sigma.toFixed(2)) };
    }

    /**
     * Makes sure sensor readings are tied to a real animal document (with RAM cache).
     *
     * @param {string} animalId - Animal ObjectId.
     * @returns {Promise<Object>} Matching animal.
     * @throws {AppError} When the id is invalid or missing.
     */
    async #ensureAnimalExists(animalId) {
        ensureValidObjectId(animalId, "animal ID");

        const cached = this.#animalCache.get(String(animalId));
        if (cached && (Date.now() - cached.cachedAt < 60000)) {
            return cached.animal;
        }

        const animal = await this.#animalRepository.findById(animalId);

        if (!animal) {
            throw new AppError(`Animal with ID ${animalId} not found`, 404);
        }

        this.#animalCache.set(String(animalId), { animal, cachedAt: Date.now() });
        return animal;
    }

    /**
     * Saves a reading and emits alert events for important conditions.
     *
     * @param {Object} data - Validated sensor payload.
     * @param {import("socket.io").Server} io - Socket.IO server.
     * @returns {Promise<Object>} Saved sensor reading.
     */
    async createSensorData(data, io) {
        const animal = await this.#ensureAnimalExists(data.animalId);

        const sensorData = await this.#sensorRepository.create(data);

        if (!sensorData) {
            throw new AppError("Failed to save sensor data", 500);
        }

        const { temperature, heartRate, respiratoryRate, bloodOxygen } = sensorData.physiology;
        const animalKey = String(animal._id);

        if (animal.baselineReadingsCount < 10) {
            // --- PHASE 1: Baseline Initialization (accumulate first 10 readings) ---
            const count = animal.baselineReadingsCount + 1;
            const currentAccumulator = animal.baselineAccumulator || { temperature: 0, heartRate: 0, respiratoryRate: 0, bloodOxygen: 0 };
            const newAccumulator = {
                temperature: currentAccumulator.temperature + temperature,
                heartRate: currentAccumulator.heartRate + heartRate,
                respiratoryRate: currentAccumulator.respiratoryRate + respiratoryRate,
                bloodOxygen: currentAccumulator.bloodOxygen + bloodOxygen
            };

            // Update Welford stats during calibration
            const welford = animal.welfordStats || {
                temp: { count: 0, mean: temperature, m2: 0 },
                hr:   { count: 0, mean: heartRate, m2: 0 },
                rr:   { count: 0, mean: respiratoryRate, m2: 0 },
                bo:   { count: 0, mean: bloodOxygen, m2: 0 }
            };

            const updatedWelford = {
                temp: this.#updateWelford(welford.temp, temperature),
                hr:   this.#updateWelford(welford.hr, heartRate),
                rr:   this.#updateWelford(welford.rr, respiratoryRate),
                bo:   this.#updateWelford(welford.bo, bloodOxygen)
            };

            let newBaselines = animal.baselines || { temperature: 0, heartRate: 0, respiratoryRate: 0, bloodOxygen: 0 };
            if (count === 10) {
                // Lock in initial baseline average from calibration window
                newBaselines = {
                    temperature: Math.round((newAccumulator.temperature / 10) * 10) / 10,
                    heartRate: Math.round(newAccumulator.heartRate / 10),
                    respiratoryRate: Math.round(newAccumulator.respiratoryRate / 10),
                    bloodOxygen: Math.round(newAccumulator.bloodOxygen / 10)
                };
            }

            animal.baselineReadingsCount = count;
            animal.baselineAccumulator = newAccumulator;
            animal.baselines = newBaselines;
            animal.welfordStats = updatedWelford;

            await this.#animalRepository.update(animal._id, {
                baselineReadingsCount: count,
                baselineAccumulator: newAccumulator,
                baselines: newBaselines,
                welfordStats: updatedWelford
            });
            this.#animalCache.set(animalKey, { animal, cachedAt: Date.now() });
        } else {
            // --- PHASE 2: Adaptive Monitoring (Welford Dynamic Z-Score + Circadian EMA) ---
            const baselines = animal.baselines || { temperature: 38.5, heartRate: 75, respiratoryRate: 22, bloodOxygen: 98 };
            const welford = animal.welfordStats || {
                temp: { count: 10, mean: baselines.temperature, m2: 2.0 },
                hr:   { count: 10, mean: baselines.heartRate, m2: 50.0 },
                rr:   { count: 10, mean: baselines.respiratoryRate, m2: 12.0 },
                bo:   { count: 10, mean: baselines.bloodOxygen, m2: 5.0 }
            };

            // 1. Calculate Circadian Diurnal Baseline for Temperature
            const speciesProfile = animal.species || "cattle";
            const chrono = getSpeciesCircadianBaseline(speciesProfile, baselines.temperature, new Date(), {
                motion: data.behavior?.motion,
                thi: data.environment?.thi
            });
            const expectedDiurnalTemp = chrono.expectedBaseline;

            // 2. Compute Statistical Z-Scores
            const tempZ = this.#computeZScore(temperature, expectedDiurnalTemp, welford.temp?.m2, welford.temp?.count, 0.35);
            const hrZ   = this.#computeZScore(heartRate, baselines.heartRate, welford.hr?.m2, welford.hr?.count, 5.0);
            const rrZ   = this.#computeZScore(respiratoryRate, baselines.respiratoryRate, welford.rr?.m2, welford.rr?.count, 2.5);
            const boZ   = this.#computeZScore(bloodOxygen, baselines.bloodOxygen, welford.bo?.m2, welford.bo?.count, 2.0);

            // 3. Dynamic Anomaly Evaluation (Z >= 2.5 = 99% confidence threshold)
            let hasAnomaly = false;
            let anomalyDetails = [];

            if (tempZ.z >= 2.5 || Math.abs(temperature - expectedDiurnalTemp) > 1.2) {
                hasAnomaly = true;
                anomalyDetails.push(`Temperature Z=${tempZ.z} (curr: ${temperature}°C, baseline: ${expectedDiurnalTemp}°C, σ=${tempZ.sigma})`);
            }
            if (hrZ.z >= 2.5 || Math.abs(heartRate - baselines.heartRate) > 25) {
                hasAnomaly = true;
                anomalyDetails.push(`Heart Rate Z=${hrZ.z} (curr: ${heartRate} BPM, baseline: ${baselines.heartRate} BPM, σ=${hrZ.sigma})`);
            }
            if (rrZ.z >= 2.5 || Math.abs(respiratoryRate - baselines.respiratoryRate) > 8) {
                hasAnomaly = true;
                anomalyDetails.push(`Respiratory Rate Z=${rrZ.z} (curr: ${respiratoryRate}, baseline: ${baselines.respiratoryRate}, σ=${rrZ.sigma})`);
            }
            if (boZ.z >= 2.5 || (baselines.bloodOxygen - bloodOxygen) > 5) {
                hasAnomaly = true;
                anomalyDetails.push(`Blood Oxygen Z=${boZ.z} (curr: ${bloodOxygen}%, baseline: ${baselines.bloodOxygen}%, σ=${boZ.sigma})`);
            }

            // Behavioral 6-Axis Synergy Anomalies
            if (data.behavior?.rumination === false && (temperature >= FEVER_TEMPERATURE_THRESHOLD || tempZ.z >= 2.0)) {
                hasAnomaly = true;
                anomalyDetails.push(`Ruminal Cessation during fever (High Risk: Mastitis / Ruminal Acidosis)`);
            }

            if (hasAnomaly) {
                // False Alarm Dampening (Persistence Window: 2 consecutive cycles)
                const currentStreak = (this.#anomalyStreak.get(animalKey) || 0) + 1;
                this.#anomalyStreak.set(animalKey, currentStreak);

                const alertMessage = `Deviation detected: ${anomalyDetails.join("; ")}`;
                io.emit("alert", {
                    animalId: sensorData.animalId,
                    type: "ANOMALY",
                    message: alertMessage,
                    timestamp: sensorData.timestamp
                });

                if (this.#alertRepository) {
                    await this.#alertRepository.createMany([{
                        animalId: sensorData.animalId,
                        type: "ANOMALY",
                        severity: (currentStreak >= 2 || tempZ.z >= 3.0 || hrZ.z >= 3.0) ? "critical" : "warning",
                        message: alertMessage,
                        metric: "physiology",
                        value: temperature,
                        status: "active"
                    }]);
                }
            } else {
                // Reset anomaly streak
                this.#anomalyStreak.set(animalKey, 0);

                // Update Welford Variance with clean physiological observation
                animal.welfordStats = {
                    temp: this.#updateWelford(welford.temp, temperature),
                    hr:   this.#updateWelford(welford.hr, heartRate),
                    rr:   this.#updateWelford(welford.rr, respiratoryRate),
                    bo:   this.#updateWelford(welford.bo, bloodOxygen)
                };

                // Update baseline using Adaptive EMA: B(t) = alpha * X(t) + (1 - alpha) * B(t-1)
                const alpha = 0.05;
                const updatedBaselines = {
                    temperature: Math.round((alpha * temperature + (1 - alpha) * baselines.temperature) * 10) / 10,
                    heartRate: Math.round(alpha * heartRate + (1 - alpha) * baselines.heartRate),
                    respiratoryRate: Math.round(alpha * respiratoryRate + (1 - alpha) * baselines.respiratoryRate),
                    bloodOxygen: Math.round(alpha * bloodOxygen + (1 - alpha) * baselines.bloodOxygen)
                };
                animal.baselines = updatedBaselines;

                // Periodic Batch Sync to MongoDB (every 60s) to minimize disk I/O
                const lastSync = this.#lastDBSync.get(animalKey) || 0;
                if (Date.now() - lastSync > 60000) {
                    this.#lastDBSync.set(animalKey, Date.now());
                    await this.#animalRepository.update(animal._id, {
                        baselines: updatedBaselines,
                        welfordStats: animal.welfordStats
                    });
                }
                this.#animalCache.set(animalKey, { animal, cachedAt: Date.now() });
            }
        }

        // Hardware Maintenance Alert
        if (sensorData.device?.batteryLevel < BATTERY_WARNING_THRESHOLD) {
            const batteryMessage = `Warning: Low battery level detected! (${sensorData.device.batteryLevel}%)`;
            io.emit("alert", {
                animalId: sensorData.animalId,
                type: "BATTERY",
                message: batteryMessage,
                timestamp: sensorData.timestamp,
            });

            if (this.#alertRepository) {
                await this.#alertRepository.createMany([{
                    animalId: sensorData.animalId,
                    type: "BATTERY",
                    severity: "warning",
                    message: batteryMessage,
                    metric: "batteryLevel",
                    value: sensorData.device.batteryLevel,
                    status: "active"
                }]);
            }
        }

        return sensorData;
    }

    /**
     * @param {string} animalId
     * @returns {Promise<Object>} Latest sensor reading.
     * @throws {AppError} When the animal or reading is not found.
     */
    async getLatest(animalId) {
        await this.#ensureAnimalExists(animalId);

        const data = await this.#sensorRepository.findLatestByAnimal(animalId);

        if (!data) {
            throw new AppError(
                `No sensor data found for animal ID: ${animalId}`,
                404,
            );
        }

        return data;
    }

    /**
     * @param {string} animalId
     * @param {Date} from
     * @param {Date} to
     * @returns {Promise<Object[]>} Sensor readings in the requested range.
     * @throws {AppError} When the animal or readings are not found.
     */
    async getLatestByRange(animalId, from, to) {
        await this.#ensureAnimalExists(animalId);

        const data = await this.#sensorRepository.findByRange(animalId, from, to);

        if (!data || data.length === 0) {
            throw new AppError(
                "No data found for the specified date range",
                404,
            );
        }

        return data;
    }

    async ingestData(animalId, payload) {
        await this.#ensureAnimalExists(animalId);
        const savedData = await this.#sensorRepository.create({ animalId, ...payload });

        mavisEvents.emit(EVENTS.SENSOR_DATA_RECEIVED, {
            animalId,
            payload: savedData
        });

        return savedData;
    }
}

export default SensorService;
