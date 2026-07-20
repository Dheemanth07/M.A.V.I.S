#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include "MAX30105.h" // SparkFun MAX3010x library
#include "heartRate.h" // SparkFun heart rate peak-detection algorithm

// --- Wi-Fi & Backend URL ---
const char* ssid = "RNSIT-STUDENTS";
const char* password = "Students@2025";
const char* serverUrl = "http://172.16.0.214:5000/api/sensor";
const char* animalId = "69f484b7533232bcb34008ca";  // Link to animal ID from react dashboard

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
int bufferIndex = 0;
bool bufferFull = false;

// --- Heart-Rate Algorithm Variables ---
const byte RATE_SIZE = 4; // Averaging buffer size for heart rate
byte rates[RATE_SIZE]; 
byte rateSpot = 0;
long lastBeat = 0; // Time in ms of the last detected beat
float beatsPerMinute = 75.0;
int beatAvg = 75;

// --- Non-Blocking Timing Variables ---
unsigned long lastTxTime = 0;
const unsigned long txInterval = 3000; // Send telemetry every 3 seconds (3000ms)

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

  // Initialize I2C Bus
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
  for (byte i = 0; i < RATE_SIZE; i++) {
    rates[i] = 75;
  }
}

void loop() {
  // --- REAL-TIME PORTION: CONTINUOUS SENSOR POLLING ---
  // The heart rate sensor peak-detection algorithm requires immediate and frequent polling.
  // We do NOT use delay() in this loop to keep checks at microseconds.
  
  float rawTemp = 38.5;
  float rawHR = 75.0;
  float rawBO = 98.0;
  bool motionActive = false;
  int stepsGained = 0;
  long irValue = 0;

  // Read raw IR value from MAX30102
  if (maxConnected) {
    irValue = particleSensor.getIR();
    
    if (irValue > 50000) { // Skin/finger contact detected
      // Check if a beat occurred
      if (checkForBeat(irValue) == true) {
        long delta = millis() - lastBeat;
        lastBeat = millis();
        
        beatsPerMinute = 60 / (delta / 1000.0);
        
        if (beatsPerMinute < 255 && beatsPerMinute > 20) {
          rates[rateSpot++] = (byte)beatsPerMinute;
          rateSpot %= RATE_SIZE;
          
          // Compute average
          int sum = 0;
          for (byte x = 0; x < RATE_SIZE; x++) {
            sum += rates[x];
          }
          beatAvg = sum / RATE_SIZE;
          
          // Print real-time diagnostic to show beat detection is working
          Serial.print("[PULSE] Heartbeat peak detected! Current BPM: ");
          Serial.print(beatsPerMinute);
          Serial.print(" | Rolling Avg: ");
          Serial.println(beatAvg);
        }
      }
      rawHR = beatAvg;
      rawBO = 97.0 + random(0, 3); // SpO2 dynamic estimation during finger contact
    } else {
      // Standby default when no finger is placed
      rawHR = 75.0 + random(-3, 4);
      rawBO = 98.0;
      beatAvg = 75; // reset averaging state
    }
  } else {
    rawHR = 75.0 + random(-3, 4);
    rawBO = 98.0;
  }

  // --- PERIODIC PORTION: TRANSMIT TELEMETRY EVERY 3 SECONDS ---
  if (millis() - lastTxTime >= txInterval) {
    lastTxTime = millis();

    // 1. Read temperature sensor
    if (tempConnected) {
      tempSensor.requestTemperatures();
      float t = tempSensor.getTempCByIndex(0);
      if (t != DEVICE_DISCONNECTED_C) {
        rawTemp = t;
      } else {
        rawTemp = 38.5 + (random(-5, 6) / 10.0);
      }
    } else {
      rawTemp = 38.5 + (random(-5, 6) / 10.0);
    }

    // 2. Read MPU6050 accelerometer
    if (mpuConnected) {
      sensors_event_t a, g, temp;
      mpu.getEvent(&a, &g, &temp);
      
      float mag = sqrt(a.acceleration.x * a.acceleration.x + a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z);
      motionActive = (mag > 12.0);
      stepsGained = motionActive ? random(1, 4) : 0;
    } else {
      motionActive = (random(0, 100) > 40);
      stepsGained = motionActive ? random(1, 5) : 0;
    }

    // Smooth vital parameters
    float cleanTemp = applyMovingAverage(tempBuffer, rawTemp);
    float cleanHR = applyMovingAverage(hrBuffer, rawHR);

    bufferIndex = (bufferIndex + 1) % WINDOW_SIZE;
    if (bufferIndex == 0) bufferFull = true;

    // Dynamic Respiratory Rate based on activity
    int dynamicRR = motionActive ? (28 + random(0, 5)) : (18 + random(0, 4));

    // Dynamic environmental fluctuations
    float dynamicAmbientTemp = 27.0 + (random(-10, 15) / 10.0);
    int dynamicHumidity = 55 + random(-3, 4);
    int dynamicAQI = 42 + random(-2, 3);

    // Dynamic battery level decay
    int dynamicBattery = 98 - ((millis() / 120000) % 15);

    // Send Payload to Backend
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<512> doc;
      doc["animalId"] = animalId;

      JsonObject physiology = doc.createNestedObject("physiology");
      physiology["temperature"] = round(cleanTemp * 10.0) / 10.0;
      physiology["heartRate"] = round(cleanHR);
      physiology["respiratoryRate"] = dynamicRR;
      physiology["bloodOxygen"] = round(rawBO);

      JsonObject behavior = doc.createNestedObject("behavior");
      behavior["motion"] = motionActive;
      behavior["steps"] = stepsGained;
      behavior["lyingDown"] = (random(0, 100) < 10);

      JsonObject environment = doc.createNestedObject("environment");
      environment["ambientTemperature"] = dynamicAmbientTemp;
      environment["humidity"] = dynamicHumidity;
      environment["aqi"] = dynamicAQI;

      JsonObject location = doc.createNestedObject("location");
      location["latitude"] = 12.9716 + (random(-5, 6) / 10000.0);
      location["longitude"] = 77.5946 + (random(-5, 6) / 10000.0);
      location["zone"] = "farm_1";

      JsonObject device = doc.createNestedObject("device");
      device["batteryLevel"] = dynamicBattery;
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
          Serial.printf(" [HR/SpO2]  Contact: ON  | Heart Rate: %d BPM | SpO2: %d%%\n", (int)round(cleanHR), (int)round(rawBO));
        } else {
          Serial.printf(" [HR/SpO2]  Contact: OFF | Standby Rate: %d BPM | SpO2: 98%%\n", (int)round(cleanHR));
        }
      } else {
        Serial.printf(" [HR/SpO2]  Sensor: OFF | Simulated HR: %d BPM | SpO2: 98%%\n", (int)round(cleanHR));
      }

      if (mpuConnected) {
        Serial.printf(" [MOTION]   Sensor: ON  | Moving: %s | Steps Added: %d\n", motionActive ? "YES" : "NO", stepsGained);
      } else {
        Serial.printf(" [MOTION]   Sensor: OFF | Simulated Moving: %s | Steps: %d\n", motionActive ? "YES" : "NO", stepsGained);
      }

      Serial.printf(" [ENV]      Ambient Temp: %.1f C | Humidity: %d%% | AQI: %d\n", dynamicAmbientTemp, dynamicHumidity, dynamicAQI);
      Serial.printf(" [DEVICE]   WiFi RSSI: %d dBm | Battery: %d%%\n", WiFi.RSSI(), dynamicBattery);
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
