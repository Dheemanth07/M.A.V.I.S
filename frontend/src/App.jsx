import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const SUMMARY_LIMIT = 100;
const FEED_LIMIT = 20;
const HEART_RATE_MAX = 140;
const HEART_RATE_MIN = 45;
const HERD_DISTANCE_THRESHOLD_METERS = 150;

const levelClass = (level) => {
    if (level === "critical") return "critical";
    if (level === "warning") return "warning";
    return "healthy";
};

const isCowSpecies = (species) => {
    const normalized = String(species ?? "").toLowerCase();
    return normalized.includes("cow") || normalized.includes("cattle");
};

const hasHeartRateAlert = (reading) => {
    const explicitHeartAlert = reading?.analytics?.alerts?.some(
        (alert) => alert.type === "HEART_RATE",
    );

    if (explicitHeartAlert) {
        return true;
    }

    const heartRate = reading?.physiology?.heartRate;
    return (
        typeof heartRate === "number" &&
        (heartRate >= HEART_RATE_MAX || heartRate <= HEART_RATE_MIN)
    );
};

const toRadians = (value) => (value * Math.PI) / 180;

const distanceInMeters = (pointA, pointB) => {
    const earthRadiusMeters = 6371000;

    const lat1 = toRadians(pointA.latitude);
    const lat2 = toRadians(pointB.latitude);
    const deltaLat = lat2 - lat1;
    const deltaLng = toRadians(pointB.longitude - pointA.longitude);

    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusMeters * c;
};

const getHerdStatus = (cowsWithReadings) => {
    if (cowsWithReadings.length === 0) {
        return {
            title: "No cows",
            detail: "No cows registered in animal profiles yet.",
            level: "warning",
        };
    }

    const missingReadings = cowsWithReadings.filter((cow) => !cow.reading).length;
    if (missingReadings > 0) {
        return {
            title: "Unknown",
            detail: `Waiting for live location from ${missingReadings} cow(s).`,
            level: "warning",
        };
    }

    const readings = cowsWithReadings.map((cow) => cow.reading);

    const zones = readings
        .map((reading) => reading.location?.zone?.trim())
        .filter(Boolean);

    if (zones.length === readings.length) {
        const uniqueZones = [...new Set(zones)];

        if (uniqueZones.length === 1) {
            return {
                title: "Together",
                detail: `All cows are in zone ${uniqueZones[0]}.`,
                level: "healthy",
            };
        }

        return {
            title: "Separated",
            detail: `Cows are split across ${uniqueZones.length} zones.`,
            level: "critical",
        };
    }

    const coordinateReadings = readings.filter(
        (reading) =>
            typeof reading.location?.latitude === "number" &&
            typeof reading.location?.longitude === "number",
    );

    if (coordinateReadings.length !== readings.length) {
        return {
            title: "Unknown",
            detail: "Location coordinates missing for one or more cows.",
            level: "warning",
        };
    }

    let maxDistanceMeters = 0;

    for (let index = 0; index < coordinateReadings.length; index += 1) {
        for (
            let innerIndex = index + 1;
            innerIndex < coordinateReadings.length;
            innerIndex += 1
        ) {
            const currentDistance = distanceInMeters(
                coordinateReadings[index].location,
                coordinateReadings[innerIndex].location,
            );
            maxDistanceMeters = Math.max(maxDistanceMeters, currentDistance);
        }
    }

    if (maxDistanceMeters <= HERD_DISTANCE_THRESHOLD_METERS) {
        return {
            title: "Together",
            detail: `Max distance is ${Math.round(maxDistanceMeters)}m.`,
            level: "healthy",
        };
    }

    return {
        title: "Separated",
        detail: `Max distance is ${Math.round(maxDistanceMeters)}m.`,
        level: "critical",
    };
};

const formatDate = (value) => {
    if (!value) return "Not updated";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not updated";
    return date.toLocaleString();
};

const emptySummary = { latestReadings: [] };

export default function App() {
    const [animals, setAnimals] = useState([]);
    const [readings, setReadings] = useState([]);
    const [heartAlertEvents, setHeartAlertEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState({
        text: "Connecting",
        color: "",
    });

    const latest = readings[0];
    const recentFeed = useMemo(() => readings.slice(0, FEED_LIMIT), [readings]);

    const latestReadingsByAnimal = useMemo(() => {
        const byAnimal = new Map();

        readings.forEach((reading) => {
            if (!byAnimal.has(reading.animalId)) {
                byAnimal.set(reading.animalId, reading);
            }
        });

        return byAnimal;
    }, [readings]);

    const cows = useMemo(
        () => animals.filter((animal) => isCowSpecies(animal.species)),
        [animals],
    );

    const cowsWithReadings = useMemo(
        () =>
            cows.map((cow) => ({
                cow,
                reading: latestReadingsByAnimal.get(cow._id),
            })),
        [cows, latestReadingsByAnimal],
    );
    const cowIdSet = useMemo(() => new Set(cows.map((cow) => cow._id)), [cows]);

    const latestHeartAlerts = useMemo(
        () => cowsWithReadings.filter((item) => item.reading && hasHeartRateAlert(item.reading)),
        [cowsWithReadings],
    );

    const alertCount = useMemo(
        () => readings.filter((reading) => reading.analytics?.riskLevel !== "healthy").length,
        [readings],
    );

    const herdStatus = useMemo(
        () => getHerdStatus(cowsWithReadings),
        [cowsWithReadings],
    );

    const displayedHeartAlerts = useMemo(() => {
        const cowHeartEvents = heartAlertEvents.filter((alert) =>
            cowIdSet.has(alert.animalId),
        );

        if (cowHeartEvents.length > 0) {
            return cowHeartEvents;
        }

        return latestHeartAlerts.map(({ cow, reading }) => ({
            id: reading._id ?? `${reading.animalId}-${reading.timestamp}`,
            animalId: reading.animalId,
            animalName: cow.name,
            message: "Abnormal heart rate detected",
            heartRate: reading.physiology?.heartRate,
            riskLevel: reading.analytics?.riskLevel ?? "warning",
            riskScore: reading.analytics?.riskScore ?? 0,
            zone: reading.location?.zone,
            timestamp: reading.timestamp,
        }));
    }, [heartAlertEvents, cowIdSet, latestHeartAlerts]);

    const loadData = useCallback(async () => {
        setIsLoading(true);

        try {
            const [animalsResponse, summaryResponse] = await Promise.all([
                fetch("/api/animals"),
                fetch(`/api/sensor/summary?limit=${SUMMARY_LIMIT}`),
            ]);

            const nextAnimals = animalsResponse.ok ? await animalsResponse.json() : [];
            const summary = summaryResponse.ok ? await summaryResponse.json() : emptySummary;

            setAnimals(Array.isArray(nextAnimals) ? nextAnimals : []);
            setReadings(Array.isArray(summary.latestReadings) ? summary.latestReadings : []);
        } catch {
            setAnimals([]);
            setReadings([]);
            setConnectionStatus({ text: "API unavailable", color: "#b42318" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const socket = io();

        socket.on("connect", () => {
            setConnectionStatus({ text: "Live", color: "#177245" });
        });

        socket.on("disconnect", () => {
            setConnectionStatus({ text: "Offline", color: "#b42318" });
        });

        socket.on("sensorUpdate", (reading) => {
            setReadings((previous) => [reading, ...previous].slice(0, SUMMARY_LIMIT));
        });

        socket.on("alert", (payload) => {
            const heartAlert = payload.alerts?.find((alert) => alert.type === "HEART_RATE");

            if (!heartAlert) {
                return;
            }

            setHeartAlertEvents((previous) => [
                {
                    id: `${payload.animalId}-${payload.timestamp}-${Date.now()}`,
                    animalId: payload.animalId,
                    message: heartAlert.message ?? "Abnormal heart rate detected",
                    heartRate: payload.physiology?.heartRate,
                    riskLevel: payload.riskLevel ?? "warning",
                    riskScore: payload.riskScore ?? 0,
                    zone: payload.location?.zone,
                    timestamp: payload.timestamp,
                },
                ...previous,
            ].slice(0, 8));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <>
            <header className="topbar">
                <div>
                    <p className="eyebrow">Multi-model Animal Vitality Intelligence System</p>
                    <h1>MAVIS</h1>
                </div>
                <div className="status-pill" style={{ color: connectionStatus.color }}>
                    {connectionStatus.text}
                </div>
            </header>

            <main className="layout">
                <section className="panel overview">
                    <div>
                        <p className="label">Latest Risk</p>
                        <strong>{latest?.analytics?.riskScore ?? "--"}</strong>
                        <span>
                            {latest
                                ? `${latest.analytics?.riskLevel ?? "healthy"} for animal ${latest.animalId}`
                                : "Waiting for data"}
                        </span>
                    </div>
                    <div>
                        <p className="label">Readings</p>
                        <strong>{readings.length}</strong>
                        <span>latest records</span>
                    </div>
                    <div>
                        <p className="label">Alerts</p>
                        <strong>{alertCount}</strong>
                        <span>warning/critical</span>
                    </div>
                    <div>
                        <p className="label">Heart Control</p>
                        <strong>{latestHeartAlerts.length}</strong>
                        <span>
                            {latestHeartAlerts.length > 0
                                ? "cow(s) with abnormal heart rate"
                                : "No active cow heart alerts"}
                        </span>
                    </div>
                    <div>
                        <p className="label">Herd Status</p>
                        <strong>{herdStatus.title}</strong>
                        <span>{herdStatus.detail}</span>
                    </div>
                </section>

                <section className="panel">
                    <div className="section-head">
                        <h2>Heart Control Alerts</h2>
                        <span>{displayedHeartAlerts.length} recent heart alert(s)</span>
                    </div>
                    <div className="feed">
                        {displayedHeartAlerts.length ? (
                            displayedHeartAlerts.map((alert) => (
                                <div className="feed-row" key={alert.id}>
                                    <div>
                                        <strong>{alert.animalName ?? alert.animalId}</strong>
                                        <div className="metrics">
                                            HR {alert.heartRate ?? "--"} bpm | {alert.message} | Zone{" "}
                                            {alert.zone ?? "unknown"}
                                        </div>
                                        <div className="metrics">{formatDate(alert.timestamp)}</div>
                                    </div>
                                    <div className={`badge ${levelClass(alert.riskLevel)}`}>
                                        {alert.riskLevel} {alert.riskScore}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="feed-row">
                                <div>
                                    <strong>No heart alerts</strong>
                                    <div className="metrics">Cow heart rates are currently in safe range.</div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="panel grid-panel">
                    <div className="section-head">
                        <h2>Live Animals</h2>
                        <button type="button" onClick={loadData} disabled={isLoading}>
                            {isLoading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                    <div className="animal-grid">
                        {animals.length ? (
                            animals.map((animal) => (
                                <article className="card" key={animal._id ?? `${animal.name}-${animal.species}`}>
                                    <h3>{animal.name}</h3>
                                    <span>
                                        {animal.species}
                                        {animal.breed ? ` / ${animal.breed}` : ""}
                                    </span>
                                    <div className={`badge ${levelClass(animal.healthStatus)}`}>
                                        {animal.healthStatus ?? "healthy"}
                                    </div>
                                </article>
                            ))
                        ) : (
                            <article className="card">
                                <h3>No animals yet</h3>
                                <span>Create animals with the API or run the simulator.</span>
                            </article>
                        )}
                    </div>
                </section>

                <section className="panel">
                    <div className="section-head">
                        <h2>Recent Sensor Feed</h2>
                        <span>{latest ? formatDate(latest.timestamp) : "Not updated"}</span>
                    </div>
                    <div className="feed">
                        {recentFeed.length ? (
                            recentFeed.map((reading) => (
                                <div className="feed-row" key={reading._id ?? `${reading.animalId}-${reading.timestamp}`}>
                                    <div>
                                        <strong>{reading.animalId}</strong>
                                        <div className="metrics">
                                            Temp {reading.physiology?.temperature ?? "--"}C | HR{" "}
                                            {reading.physiology?.heartRate ?? "--"} | O2{" "}
                                            {reading.physiology?.bloodOxygen ?? "--"}% | Battery{" "}
                                            {reading.device?.batteryLevel ?? "--"}% | Zone{" "}
                                            {reading.location?.zone ?? "unknown"}
                                        </div>
                                    </div>
                                    <div className={`badge ${levelClass(reading.analytics?.riskLevel)}`}>
                                        {reading.analytics?.riskLevel ?? "healthy"} {reading.analytics?.riskScore ?? 0}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="feed-row">
                                <div>
                                    <strong>No readings yet</strong>
                                    <div className="metrics">Run the simulator to stream demo data.</div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}
