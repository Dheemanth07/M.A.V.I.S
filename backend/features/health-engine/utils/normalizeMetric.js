/**
 * Safely extracts and parses a sensor metric to a float.
 * Prevents the engine from crashing if the collar sends bad data or nulls.
 * * @param {any} value - The raw sensor value.
 * @param {any} [fallback=null] - What to return if parsing fails.
 * @returns {number|null} The clean numeric value or the fallback.
 */
export function normalizeMetric(value, fallback = null) {
    if (value === null || value === undefined) return fallback;
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
}