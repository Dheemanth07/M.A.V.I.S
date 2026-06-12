
/**
 * Ensures a calculated risk score stays within a defined floor and ceiling.
 * * @param {number} score - The calculated risk score.
 * @param {number} [min=0] - The minimum allowed value.
 * @param {number} [max=100] - The maximum allowed value.
 * @returns {number} The clamped score.
 */
export function clampRisk(score, min = 0, max = 100) {
    if (typeof score !== "number" || isNaN(score)) return min;
    return Math.max(min, Math.min(max, score));
}
