/**
 * @file Socket.IO client listener to verify real-time alerts.
 * Exits with code 0 once both FEVER and BATTERY alerts have been received.
 */

import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";
console.log(`Connecting to Socket.IO server at ${SOCKET_URL}...`);

const socket = io(SOCKET_URL, {
    transports: ["websocket"]
});

let feverAlertsReceived = [];
let batteryAlertsReceived = [];

socket.on("connect", () => {
    console.log(`Successfully connected! Socket ID: ${socket.id}`);
    console.log("Listening for alert events...");
});

socket.on("connect_error", (error) => {
    console.error("Connection error:", error.message);
});

socket.on("alert", (alertData) => {
    console.log("\n[ALERT RECEIVED] :", JSON.stringify(alertData, null, 2));

    if (alertData.type === "FEVER" || alertData.type === "ANOMALY") {
        feverAlertsReceived.push(alertData);
    } else if (alertData.type === "BATTERY") {
        batteryAlertsReceived.push(alertData);
    }

    console.log(`Progress: FEVER/ANOMALY alerts = ${feverAlertsReceived.length}, BATTERY alerts = ${batteryAlertsReceived.length}`);

    // Exit gracefully after we have verified both types of alerts
    if (feverAlertsReceived.length >= 1 && batteryAlertsReceived.length >= 1) {
        console.log("\n==========================================");
        console.log("SUCCESS: Received both ANOMALY/FEVER and BATTERY alerts!");
        console.log(`Total FEVER alerts captured: ${feverAlertsReceived.length}`);
        console.log(`Total BATTERY alerts captured: ${batteryAlertsReceived.length}`);
        console.log("Exiting verification script gracefully.");
        console.log("==========================================");
        socket.disconnect();
        process.exit(0);
    }
});

// Set a safety timeout to exit if we don't receive alerts within 60 seconds
setTimeout(() => {
    console.log("\n[TIMEOUT] Reached 60s limit waiting for alerts.");
    console.log(`Final count: FEVER alerts = ${feverAlertsReceived.length}, BATTERY alerts = ${batteryAlertsReceived.length}`);
    socket.disconnect();
    if (feverAlertsReceived.length >= 1 && batteryAlertsReceived.length >= 1) {
        process.exit(0);
    } else {
        console.error("FAIL: Did not receive all expected alert types (need at least 1 ANOMALY/FEVER and 1 BATTERY alert).");
        process.exit(1);
    }
}, 60000);
