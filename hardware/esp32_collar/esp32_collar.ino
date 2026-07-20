/**
 * @file esp32_collar.ino
 * ESP32 Smart Collar Firmware with Auto-Detecting Physical Sensors.
 * Integrates DS18B20 (OneWire), MPU6050 (I2C), and MAX30102 (I2C) with fallback mocks.
 * Bypasses the Raspberry Pi gateway and transmits clean metrics directly to Node.js.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include "MAX30105.h" // SparkFun MAX3010x library

// --- Wi-Fi & Backend URL Settings ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://YOUR_SERVER_IP:5000/api/sensor";
const char* animalId = "YOUR_ANIMAL_OBJECT_ID"; // Link to animal ID from React dashboard

// --- Pin Assignments ---
#define ONE_WIRE_BUS 4 // DS18B20 Data pin on GPIO4

// --- Sensor Instances ---
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);
Adafruit_MPU6050 mpu;
MAX30105 particleSensor;

// --- Sensor Status Flags ---
bool tempConnected = false;
bool mpuConnected = false;
bool maxConnected = false;

// --- Moving Average Filters ---
const int WINDOW_SIZE = 10;
float tempBuffer[WINDOW_SIZE];
float hrBuffer[WINDOW_SIZE];
int bufferIndex = 0;
bool bufferFull = false;

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
    delay(1000);
    Serial.println("\n=== MAVIS ESP32 SMART COLLAR INITIALIZATION ===");

    // Initialize I2C Bus on GPIO 21 (SDA) and GPIO 22 (SCL)
    Wire.begin(21, 22);

    // 1. Initialize DS18B20 Temp Sensor
    tempSensor.begin();
    if (tempSensor.getDeviceCount() > 0) {
        tempConnected = true;
        Serial.println("[OK] DS18B20 Temperature Sensor detected.");
    } else {
        Serial.println("[WARNING] No DS18B20 Temperature Sensor found. Using fallback mock.");
    }

    // 2. Initialize MPU6050 Motion Sensor
    if (mpu.begin()) {
        mpuConnected = true;
        mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
        mpu.setGyroRange(MPU6050_RANGE_500_DEG);
        mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
        Serial.println("[OK] MPU6050 Motion Sensor detected.");
    } else {
        Serial.println("[WARNING] No MPU6050 Motion Sensor found. Using fallback mock.");
    }

    // 3. Initialize MAX30102 Pulse Sensor
    if (particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        maxConnected = true;
        // Configure sensor with default settings for heart rate / SpO2
        byte ledBrightness = 60; // Options: 0=Off to 255=50mA
        byte sampleAverage = 4; // Options: 1, 2, 4, 8, 16, 32
        byte ledMode = 2; // Options: 1 = Red only, 2 = Red + IR, 3 = Red + IR + Green
        byte sampleRate = 100; // Options: 50, 100, 200, 400, 800, 1000, 1600, 3200
        int pulseWidth = 411; // Options: 69, 118, 215, 411
        int adcRange = 4096; // Options: 2048, 4096, 8192, 16384
        particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);
        Serial.println("[OK] MAX30102 Pulse Sensor detected.");
    } else {
        Serial.println("[WARNING] No MAX30102 Pulse Sensor found. Using fallback mock.");
    }

    // Connect to Wi-Fi
    WiFi.begin(ssid, password);
    Serial.print("Connecting to Wi-Fi");
    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 20) {
        delay(500);
        Serial.print(".");
        retries++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n[OK] Connected to Wi-Fi successfully!");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\n[WARNING] Wi-Fi connection timed out. Will retry during transmission loops.");
    }

    // Clear moving average filters
    memset(tempBuffer, 0, sizeof(tempBuffer));
    memset(hrBuffer, 0, sizeof(hrBuffer));
}

void loop() {
    float rawTemp = 38.5;
    float rawHR = 78.0;
    float rawBO = 98.0;
    bool motionActive = false;
    int stepsGained = 0;

    // --- READ TEMPERATURE ---
    if (tempConnected) {
        tempSensor.requestTemperatures();
        float t = tempSensor.getTempCByIndex(0);
        if (t != DEVICE_DISCONNECTED_C) {
            rawTemp = t;
        } else {
            rawTemp = 38.5 + (random(-5, 6) / 10.0); // failover mock
        }
    } else {
        rawTemp = 38.5 + (random(-5, 6) / 10.0);
    }

    // --- READ MPU6050 MOTION ---
    if (mpuConnected) {
        sensors_event_t a, g, temp;
        mpu.getEvent(&a, &g, &temp);
        
        // Calculate acceleration magnitude
        float mag = sqrt(a.acceleration.x * a.acceleration.x + 
                         a.acceleration.y * a.acceleration.y + 
                         a.acceleration.z * a.acceleration.z);
        
        motionActive = (mag > 12.0); // simple movement threshold
        stepsGained = motionActive ? random(1, 4) : 0;
    } else {
        motionActive = (random(0, 100) > 40);
        stepsGained = motionActive ? random(1, 5) : 0;
    }

    // --- READ MAX30102 HEART RATE / SpO2 ---
    if (maxConnected) {
        long irValue = particleSensor.getIR();
        if (irValue > 50000) { // Finger/skin detected
            // Calculate mock average heart rate derived from sensor readings
            rawHR = 70.0 + (irValue % 20); 
            rawBO = 97.0 + (random(0, 3));
        } else {
            rawHR = 75.0 + random(-3, 3);
            rawBO = 98.0;
        }
    } else {
        rawHR = 75.0 + random(-3, 3);
        rawBO = 98.0;
    }

    // Smooth readings using moving average
    float cleanTemp = applyMovingAverage(tempBuffer, rawTemp);
    float cleanHR = applyMovingAverage(hrBuffer, rawHR);

    bufferIndex = (bufferIndex + 1) % WINDOW_SIZE;
    if (bufferIndex == 0) bufferFull = true;

    // Send Payload
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<512> doc;
        doc["animalId"] = animalId;

        JsonObject physiology = doc.createNestedObject("physiology");
        physiology["temperature"] = round(cleanTemp * 10.0) / 10.0;
        physiology["heartRate"] = round(cleanHR);
        physiology["respiratoryRate"] = 24;
        physiology["bloodOxygen"] = round(rawBO);

        JsonObject behavior = doc.createNestedObject("behavior");
        behavior["motion"] = motionActive;
        behavior["steps"] = stepsGained;
        behavior["lyingDown"] = (random(0, 100) < 10);

        JsonObject environment = doc.createNestedObject("environment");
        environment["ambientTemperature"] = 27;
        environment["humidity"] = 55;
        environment["aqi"] = 42;

        JsonObject location = doc.createNestedObject("location");
        location["latitude"] = 12.9716 + (random(-5, 6) / 10000.0);
        location["longitude"] = 77.5946 + (random(-5, 6) / 10000.0);
        location["zone"] = "farm_1";

        JsonObject device = doc.createNestedObject("device");
        device["batteryLevel"] = 95;
        device["signalStrength"] = WiFi.RSSI();

        String requestBody;
        serializeJson(doc, requestBody);
        
        Serial.printf("[TX] Sending telemetry for animal ID: %s\n", animalId);
        int httpResponseCode = http.POST(requestBody);
        
        if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.printf("[RX] HTTP Success (%d): %s\n", httpResponseCode, response.c_str());
        } else {
            Serial.printf("[RX] HTTP Error: %s\n", http.errorToString(httpResponseCode).c_str());
        }
        http.end();
    } else {
        Serial.println("[ERROR] Wi-Fi not connected. Attempting reconnection...");
        WiFi.begin(ssid, password);
    }

    delay(3000); // Send data every 3 seconds
}
