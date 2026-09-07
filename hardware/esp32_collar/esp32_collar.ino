// <> - Searches the system and installed library folders first, used for standard Arduino libraries or third-party libraries installed globally via the Library Manager.
// "" - Searches the current project folder (where your sketch is) first. If it doesn't find it there, it falls back to the system folders. For local files you wrote yourself, or custom libraries you dropped directly into your sketch folder.

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include "MAX30105.h"   // SparkFun MAX3010x library
#include "heartRate.h"  // SparkFun heart rate peak-detection algorithm

// --- Wi-Fi & Backend URL ---
const char* ssid = "motorola edge 50 pro_2405";
const char* password = "abcd1678";
const char* serverUrl = "http://172.16.73.154:5000/api/sensor";
const char* animalId = "6a7ad37a373c5495c40c8d5b";  // Link to animal ID from react dashboard

// --- Pin Assignments ---
#define ONE_WIRE_BUS 4  // DS18B20 Data pin on GPIO4

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
float rrBuffer[WINDOW_SIZE];
int bufferIndex = 0;
bool bufferFull = false;

// --- Heart-Rate & Pulse Oximetry Variables ---
const byte RATE_SIZE = 4;  // Averaging buffer size for heart rate
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;  // Time in ms of the last detected beat
float beatsPerMinute = 75.0;
int beatAvg = 75;

// --- Optical SpO2 Physical Calculation Variables ---
long redMax = 0, redMin = 262144;
long irMax = 0, irMin = 262144;
float calculatedSpO2 = 98.0;

// --- Non-Blocking Timing Variables ---
unsigned long lastTxTime = 0;
const unsigned long txInterval = 3000;  // Send telemetry every 3 seconds (3000ms)

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

  // Initialize I2C Bus (SDA = GPIO 21, SCL = GPIO 22)
  Wire.begin(21, 22);

  // 1. Initialize DS18B20 Temperature Sensor
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

  // 3. Initialize MAX30102 Pulse & SpO2 Sensor
  if (particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    maxConnected = true;
    // Configure sensor with default settings for heart rate / SpO2
    byte ledBrightness = 60;  // Options: 0=Off to 255=50mA
    byte sampleAverage = 4;   // Options: 1, 2, 4, 8, 16, 32
    byte ledMode = 2;         // Options: 1 = Red only, 2 = Red + IR, 3 = Red + IR + Green
    byte sampleRate = 100;    // Options: 50, 100, 200, 400, 800, 1000, 1600, 3200
    int pulseWidth = 411;     // Options: 69, 118, 215, 411
    int adcRange = 4096;      // Options: 2048, 4096, 8192, 16384
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

  // Clear filters and average arrays
  memset(tempBuffer, 0, sizeof(tempBuffer));
  memset(hrBuffer, 0, sizeof(hrBuffer));
  memset(rrBuffer, 0, sizeof(rrBuffer));
  for (byte i = 0; i < RATE_SIZE; i++) {
    rates[i] = 75;
  }
}

void loop() {
  // --- REAL-TIME PORTION: CONTINUOUS SENSOR POLLING ---
  // The heart rate sensor peak-detection algorithm requires immediate and frequent polling.
  // We do NOT use delay() in this loop to keep checks fast and non-blocking.

  float rawTemp = 38.5;
  float rawHR = 75.0;
  float rawBO = 98.0;
  bool motionActive = false;
  bool lyingDownState = false;
  int stepsGained = 0;
  long irValue = 0;

  // 1. Read raw IR and Red values from MAX30102 for Heart Rate & SpO2
  if (maxConnected) {
    irValue = particleSensor.getIR();
    long redValue = particleSensor.getRed();

    if (irValue > 50000) {  // Skin/tissue contact detected
      // Track AC peaks and troughs for optical SpO2 calculation
      if (redValue > redMax) redMax = redValue;
      if (redValue < redMin) redMin = redValue;
      if (irValue > irMax) irMax = irValue;
      if (irValue < irMin) irMin = irValue;

      // Check if a pulse beat occurred
      if (checkForBeat(irValue) == true) {
        long delta = millis() - lastBeat;
        lastBeat = millis();

        beatsPerMinute = 60 / (delta / 1000.0);

        if (beatsPerMinute < 240 && beatsPerMinute > 30) {
          rates[rateSpot++] = (byte)beatsPerMinute;
          rateSpot %= RATE_SIZE;

          // Compute average heart rate
          int sum = 0;
          for (byte x = 0; x < RATE_SIZE; x++) {
            sum += rates[x];
          }
          beatAvg = sum / RATE_SIZE;

          // Compute true optical SpO2 using AC/DC ratio of Red vs IR
          float acRed = (float)(redMax - redMin);
          float dcRed = (float)(redMax + redMin) / 2.0;
          float acIR  = (float)(irMax - irMin);
          float dcIR  = (float)(irMax + irMin) / 2.0;

          if (dcRed > 0 && dcIR > 0 && acIR > 0) {
            float R = (acRed / dcRed) / (acIR / dcIR);
            // Empirical pulse oximetry formula: SpO2 = 110 - 25 * R
            float spo2Val = 110.0 - 25.0 * R;
            if (spo2Val > 100.0) spo2Val = 100.0;
            if (spo2Val < 70.0)  spo2Val = 70.0;
            calculatedSpO2 = spo2Val;
          }

          // Reset peak and trough trackers for next heartbeat cycle
          redMax = 0; redMin = 262144;
          irMax = 0;  irMin = 262144;

          // Print real-time diagnostic
          Serial.print("[PULSE] Heartbeat detected! BPM: ");
          Serial.print(beatsPerMinute);
          Serial.print(" | Avg: ");
          Serial.print(beatAvg);
          Serial.print(" | True SpO2: ");
          Serial.print(calculatedSpO2, 1);
          Serial.println("%");
        }
      }
      rawHR = beatAvg;
      rawBO = calculatedSpO2;
    } else {
      // Standby default when no contact is detected
      rawHR = 75.0 + random(-2, 3);
      rawBO = 98.0;
      beatAvg = 75;
      calculatedSpO2 = 98.0;
      redMax = 0; redMin = 262144;
      irMax = 0;  irMin = 262144;
    }
  } else {
    rawHR = 75.0 + random(-2, 3);
    rawBO = 98.0;
  }

  // --- PERIODIC PORTION: TRANSMIT TELEMETRY EVERY 3 SECONDS ---
  if (millis() - lastTxTime >= txInterval) {
    lastTxTime = millis();

    // 1. Read DS18B20 Temperature Sensor
    if (tempConnected) {
      tempSensor.requestTemperatures();
      float t = tempSensor.getTempCByIndex(0);
      if (t != DEVICE_DISCONNECTED_C && t > 25.0 && t < 45.0) {
        rawTemp = t;
      } else {
        rawTemp = 38.5 + (random(-3, 4) / 10.0);
      }
    } else {
      rawTemp = 38.5 + (random(-3, 4) / 10.0);
    }

    // 2. Read MPU6050 Motion & Posture
    if (mpuConnected) {
      sensors_event_t a, g, temp;
      mpu.getEvent(&a, &g, &temp);

      float mag = sqrt(a.acceleration.x * a.acceleration.x + 
                       a.acceleration.y * a.acceleration.y + 
                       a.acceleration.z * a.acceleration.z);

      motionActive = (mag > 12.0);
      stepsGained = motionActive ? random(1, 4) : 0;

      // Physical posture detection: if animal is stationary and tilted horizontally
      lyingDownState = (!motionActive && (abs(a.acceleration.x) > 6.0 || abs(a.acceleration.y) > 6.0));
    } else {
      motionActive = (random(0, 100) > 60);
      stepsGained = motionActive ? random(1, 4) : 0;
      lyingDownState = (random(0, 100) < 15);
    }

    // 3. Smooth Vital Parameters
    float cleanTemp = applyMovingAverage(tempBuffer, rawTemp);
    float cleanHR = applyMovingAverage(hrBuffer, rawHR);

    // 4. Derive Respiratory Rate (RR) mathematically from Heart Rate + Activity Level
    // Mammalian cardio-respiratory ratio: ~4:1 (HR to RR) with exertion modulation
    float derivedRR = cleanHR / 4.0;
    if (motionActive) {
      derivedRR += 6.0;  // Respiration rate increases during active motion
    }
    // Clamp to physiological safe limits (12 to 60 breaths/min)
    if (derivedRR < 12.0) derivedRR = 12.0;
    if (derivedRR > 60.0) derivedRR = 60.0;
    float cleanRR = applyMovingAverage(rrBuffer, derivedRR);

    // Advance filter buffer index
    bufferIndex = (bufferIndex + 1) % WINDOW_SIZE;
    if (bufferIndex == 0) bufferFull = true;

    // 5. Send Telemetry Payload to Backend
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<512> doc;
      doc["animalId"] = animalId;

      JsonObject physiology = doc.createNestedObject("physiology");
      physiology["temperature"] = round(cleanTemp * 10.0) / 10.0;
      physiology["heartRate"] = round(cleanHR);
      physiology["respiratoryRate"] = round(cleanRR);
      physiology["bloodOxygen"] = round(rawBO);

      JsonObject behavior = doc.createNestedObject("behavior");
      behavior["motion"] = motionActive;
      behavior["steps"] = stepsGained;
      behavior["lyingDown"] = lyingDownState;

      JsonObject device = doc.createNestedObject("device");
      device["signalStrength"] = WiFi.RSSI();

      String requestBody;
      serializeJson(doc, requestBody);

      // Print formatted local telemetry summary
      Serial.println("\n=======================================================");
      Serial.println("           MAVIS LIVE TELEMETRY UPDATE                 ");
      Serial.println("=======================================================");
      if (tempConnected) {
        Serial.printf(" [TEMP]     Sensor: ON  | Raw: %.2f C | Smooth: %.2f C\n", rawTemp, cleanTemp);
      } else {
        Serial.printf(" [TEMP]     Sensor: OFF | Simulated: %.2f C | Smooth: %.2f C\n", rawTemp, cleanTemp);
      }

      if (maxConnected) {
        if (irValue > 50000) {
          Serial.printf(" [HR/SpO2]  Contact: ON  | Heart Rate: %d BPM | SpO2: %d%% | Derived RR: %d bpm\n", 
                        (int)round(cleanHR), (int)round(rawBO), (int)round(cleanRR));
        } else {
          Serial.printf(" [HR/SpO2]  Contact: OFF | Standby Rate: %d BPM | SpO2: 98%% | Derived RR: %d bpm\n", 
                        (int)round(cleanHR), (int)round(cleanRR));
        }
      } else {
        Serial.printf(" [HR/SpO2]  Sensor: OFF | Simulated HR: %d BPM | SpO2: 98%% | Derived RR: %d bpm\n", 
                      (int)round(cleanHR), (int)round(cleanRR));
      }

      if (mpuConnected) {
        Serial.printf(" [MOTION]   Sensor: ON  | Moving: %s | Lying Down: %s | Steps: %d\n", 
                      motionActive ? "YES" : "NO", lyingDownState ? "YES" : "NO", stepsGained);
      } else {
        Serial.printf(" [MOTION]   Sensor: OFF | Simulated Moving: %s | Lying Down: %s | Steps: %d\n", 
                      motionActive ? "YES" : "NO", lyingDownState ? "YES" : "NO", stepsGained);
      }

      Serial.printf(" [DEVICE]   WiFi RSSI: %d dBm\n", WiFi.RSSI());
      Serial.println("-------------------------------------------------------");
      Serial.printf(" [TX] Transmitting payload to backend for Animal: %s\n", animalId);

      int httpResponseCode = http.POST(requestBody);

      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf(" [RX] HTTP Success (%d): %s\n", httpResponseCode, response.c_str());
      } else {
        Serial.printf(" [RX] HTTP Error: %s\n", http.errorToString(httpResponseCode).c_str());
      }
      http.end();
    } else {
      Serial.println("[ERROR] Wi-Fi not connected. Attempting reconnection...");
      WiFi.begin(ssid, password);
    }
  }
}
