#include <WiFi.h>
#include <HTTPClient.h>

// Replace these values before uploading.
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Use your computer IP address, not localhost.
// Example: http://192.168.1.10:5000/api/sensor
const char* SENSOR_API_URL = "http://YOUR_COMPUTER_IP:5000/api/sensor";

// Create an animal in MAVIS first, then paste its _id here.
const char* ANIMAL_ID = "PASTE_ANIMAL_ID_HERE";

const unsigned long SEND_INTERVAL_MS = 5000;
unsigned long lastSendAt = 0;

// Optional analog pins. Change these to match your wiring.
const int TEMP_PIN = 34;
const int HEART_PIN = 35;
const int OXYGEN_PIN = 32;
const int BATTERY_PIN = 33;

float mapFloat(float value, float inMin, float inMax, float outMin, float outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

float readAnalogMapped(int pin, float outMin, float outMax) {
  int raw = analogRead(pin);
  return mapFloat(raw, 0, 4095, outMin, outMax);
}

float readTemperatureC() {
  // Replace with your real temperature sensor code if using DS18B20, MLX90614, etc.
  return readAnalogMapped(TEMP_PIN, 36.5, 41.5);
}

int readHeartRate() {
  // Replace with your real pulse sensor/MAX30102 heart-rate calculation.
  return (int)readAnalogMapped(HEART_PIN, 55, 155);
}

int readBloodOxygen() {
  // Replace with your real SpO2 calculation.
  return (int)readAnalogMapped(OXYGEN_PIN, 84, 99);
}

int readRespiratoryRate() {
  // Replace with your real respiration sensor calculation.
  return 24;
}

int readBatteryLevel() {
  return constrain((int)readAnalogMapped(BATTERY_PIN, 0, 100), 0, 100);
}

String buildSensorJson() {
  float temperature = readTemperatureC();
  int heartRate = readHeartRate();
  int respiratoryRate = readRespiratoryRate();
  int bloodOxygen = readBloodOxygen();
  int batteryLevel = readBatteryLevel();

  String json = "{";
  json += "\"animalId\":\"" + String(ANIMAL_ID) + "\",";
  json += "\"physiology\":{";
  json += "\"temperature\":" + String(temperature, 1) + ",";
  json += "\"heartRate\":" + String(heartRate) + ",";
  json += "\"respiratoryRate\":" + String(respiratoryRate) + ",";
  json += "\"bloodOxygen\":" + String(bloodOxygen);
  json += "},";
  json += "\"behavior\":{";
  json += "\"motion\":true,";
  json += "\"steps\":20,";
  json += "\"lyingDown\":false";
  json += "},";
  json += "\"environment\":{";
  json += "\"ambientTemperature\":30,";
  json += "\"humidity\":60";
  json += "},";
  json += "\"device\":{";
  json += "\"batteryLevel\":" + String(batteryLevel) + ",";
  json += "\"signalStrength\":" + String(WiFi.RSSI());
  json += "}";
  json += "}";

  return json;
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("Connected. ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

void sendSensorReading() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  HTTPClient http;
  String payload = buildSensorJson();

  http.begin(SENSOR_API_URL);
  http.addHeader("Content-Type", "application/json");

  int statusCode = http.POST(payload);
  String response = http.getString();

  Serial.print("POST status: ");
  Serial.println(statusCode);
  Serial.print("Response: ");
  Serial.println(response);

  http.end();
}

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  connectWiFi();
}

void loop() {
  unsigned long now = millis();

  if (now - lastSendAt >= SEND_INTERVAL_MS) {
    lastSendAt = now;
    sendSensorReading();
  }
}
