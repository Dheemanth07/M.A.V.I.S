/**
 * @file esp32_collar.ino
 * ESP32 Smart Collar Firmware with Built-in Moving Average Noise Filtering.
 * Bypasses the Raspberry Pi gateway and transmits clean metrics directly to Node.js.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Standard ArduinoJson library (v6 or v7)

// --- Wi-Fi Settings ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// --- Backend API Settings ---
const char* serverUrl = "http://YOUR_SERVER_IP:5000/api/sensor";

// --- Mocking Sensors (Representing physical DS18B20 and MPU6050) ---
// In a real physical setup, include:
// #include <OneWire.h>
// #include <DallasTemperature.h>
// #include <Adafruit_MPU6050.h>
// #include <Adafruit_Sensor.h>
// #include <Wire.h>

const int WINDOW_SIZE = 10;

// --- Moving Average Buffers ---
float tempBuffer[WINDOW_SIZE];
float hrBuffer[WINDOW_SIZE];
float rrBuffer[WINDOW_SIZE];
float boBuffer[WINDOW_SIZE];

int bufferIndex = 0;
bool bufferFull = false;

// Seed Mock Data Generators
float mockBaseTemp = 38.5;
float mockBaseHR = 80.0;
float mockBaseRR = 20.0;
float mockBaseBO = 98.0;

// Helper to push a value into a buffer and compute the moving average
float applyMovingAverage(float* buffer, float newValue) {
    buffer[bufferIndex] = newValue;
    
    int count = bufferFull ? WINDOW_SIZE : (bufferIndex + 1);
    float sum = 0;
    for (int i = 0; i < count; i++) {
        sum += buffer[i];
    }
    return sum / count;
}

void setup() {
    Serial.begin(115200);
    
    // Connect to Wi-Fi
    WiFi.begin(ssid, password);
    Serial.print("Connecting to Wi-Fi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected to Wi-Fi successfully!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    // Initialize buffers to 0
    memset(tempBuffer, 0, sizeof(tempBuffer));
    memset(hrBuffer, 0, sizeof(hrBuffer));
    memset(rrBuffer, 0, sizeof(rrBuffer));
    memset(boBuffer, 0, sizeof(boBuffer));
}

void loop() {
    // 1. Read raw sensors (simulated here with mock fluctuations + noise spikes)
    // In physical deployment:
    // sensors.requestTemperatures();
    // float rawTemp = sensors.getTempCByIndex(0);
    
    // Simulate raw reading with high-frequency noise spikes
    float noise = (random(-100, 100) / 100.0) * 0.5; // +/- 0.5°C jitter
    if (random(0, 100) < 5) { // 5% chance of garbage startup/sensor spike
        noise += (random(0, 2) == 0) ? 3.0 : -3.0; // +/- 3°C spike
    }
    float rawTemp = mockBaseTemp + noise;

    float rawHR = mockBaseHR + random(-5, 6);
    float rawRR = mockBaseRR + random(-2, 3);
    float rawBO = mockBaseBO + random(-1, 1);
    if (rawBO > 100.0) rawBO = 100.0;

    Serial.printf("\n[RAW READINGS] Temp: %.2f C, HR: %.1f, RR: %.1f, BO: %.1f%%\n", rawTemp, rawHR, rawRR, rawBO);

    // 2. Apply moving average filter locally to smooth out noise spikes
    float cleanTemp = applyMovingAverage(tempBuffer, rawTemp);
    float cleanHR = applyMovingAverage(hrBuffer, rawHR);
    float cleanRR = applyMovingAverage(rrBuffer, rawRR);
    float cleanBO = applyMovingAverage(boBuffer, rawBO);

    // Update buffer indexes
    bufferIndex = (bufferIndex + 1) % WINDOW_SIZE;
    if (bufferIndex == 0) {
        bufferFull = true;
    }

    Serial.printf("[SMOOTHED (EMA/MA)] Temp: %.2f C, HR: %.1f, RR: %.1f, BO: %.1f%%\n", cleanTemp, cleanHR, cleanRR, cleanBO);

    // 3. Submit payload if Wi-Fi is connected
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");

        // Construct JSON Payload
        StaticJsonDocument<512> doc;
        doc["animalId"] = "YOUR_ANIMAL_OBJECT_ID_FROM_BACKEND"; // To be updated during pairing
        
        JsonObject physiology = doc.createNestedObject("physiology");
        physiology["temperature"] = round(cleanTemp * 10.0) / 10.0; // round to 1 decimal place
        physiology["heartRate"] = round(cleanHR);
        physiology["respiratoryRate"] = round(cleanRR);
        physiology["bloodOxygen"] = round(cleanBO);

        JsonObject behavior = doc.createNestedObject("behavior");
        behavior["motion"] = (random(0, 100) > 30); // 70% active
        behavior["steps"] = random(10, 150);
        behavior["lyingDown"] = (random(0, 100) < 15);

        JsonObject environment = doc.createNestedObject("environment");
        environment["ambientTemperature"] = 28;
        environment["humidity"] = 60;
        environment["aqi"] = 50;

        JsonObject location = doc.createNestedObject("location");
        location["latitude"] = 12.9716;
        location["longitude"] = 77.5946;
        location["zone"] = "farm_1";

        JsonObject device = doc.createNestedObject("device");
        device["batteryLevel"] = 98;
        device["signalStrength"] = WiFi.RSSI();

        String requestBody;
        serializeJson(doc, requestBody);

        Serial.println("Sending payload directly to Node.js backend...");
        int httpResponseCode = http.POST(requestBody);

        if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.printf("HTTP Response code: %d\n", httpResponseCode);
            Serial.println("Response: " + response);
        } else {
            Serial.printf("Error on sending POST request: %s\n", http.errorToString(httpResponseCode).c_str());
        }

        http.end();
    } else {
        Serial.println("Wi-Fi connection lost!");
    }

    // Delay 5 seconds between loop runs
    delay(5000);
}
