
/**
 * Calculates the Temperature Humidity Index (THI) for environmental stress.
 * * @param {number} tempCelsius - Ambient temperature in Celsius.
 * @param {number} relativeHumidity - Relative humidity percentage.
 * @returns {number|null} The calculated THI rounded to 2 decimal places.
 */
export function calculateTHI(tempCelsius, relativeHumidity) {
    if (typeof tempCelsius !== "number" || typeof relativeHumidity !== "number") {
        return null;
    }

    const t = tempCelsius;
    const rh = relativeHumidity;

    const thi = (1.8 * t + 32) - ((0.55 - 0.0055 * rh) * (1.8 * t - 26));
    
    return Math.round(thi * 100) / 100;
}