const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const addRisk = (alerts, condition, points, type, message) => {
    if (condition) {
        alerts.push({ type, message, points });
        return points;
    }

    return 0;
};

export const analyzeSensorReading = (reading) => {
    const { physiology, behavior = {}, environment = {}, device = {} } = reading;
    const alerts = [];
    let riskScore = 0;

    riskScore += addRisk(
        alerts,
        physiology.temperature >= 40,
        35,
        "FEVER",
        "High body temperature detected",
    );
    riskScore += addRisk(
        alerts,
        physiology.temperature <= 35,
        25,
        "HYPOTHERMIA",
        "Low body temperature detected",
    );
    riskScore += addRisk(
        alerts,
        physiology.heartRate >= 140 || physiology.heartRate <= 45,
        20,
        "HEART_RATE",
        "Abnormal heart rate detected",
    );
    riskScore += addRisk(
        alerts,
        physiology.respiratoryRate >= 45 || physiology.respiratoryRate <= 8,
        15,
        "RESPIRATION",
        "Abnormal respiratory rate detected",
    );
    riskScore += addRisk(
        alerts,
        physiology.bloodOxygen <= 88,
        25,
        "LOW_OXYGEN",
        "Low blood oxygen detected",
    );
    riskScore += addRisk(
        alerts,
        behavior.lyingDown === true && behavior.motion === false,
        10,
        "LOW_ACTIVITY",
        "Low activity pattern detected",
    );
    riskScore += addRisk(
        alerts,
        environment.ambientTemperature >= 38,
        10,
        "HEAT_STRESS",
        "High ambient temperature may cause heat stress",
    );
    riskScore += addRisk(
        alerts,
        device.batteryLevel !== undefined && device.batteryLevel < 20,
        10,
        "BATTERY",
        "Low wearable battery level",
    );

    riskScore = clamp(riskScore, 0, 100);

    let riskLevel = "healthy";
    if (riskScore >= 70) {
        riskLevel = "critical";
    } else if (riskScore >= 30) {
        riskLevel = "warning";
    }

    return {
        riskScore,
        riskLevel,
        alerts,
    };
};
