# ESP32 MAVIS Sensor Client

This Arduino sketch sends sensor readings from an ESP32 to the MAVIS backend.

## Before Uploading

1. Start MAVIS:

```powershell
docker compose up -d
```

2. Find your computer IP address:

```powershell
ipconfig
```

Use the IPv4 address on the same Wi-Fi network as the ESP32.

3. Create or get an animal ID:

```powershell
Invoke-RestMethod http://localhost:5000/api/animals
```

If the list is empty, create one:

```powershell
Invoke-RestMethod http://localhost:5000/api/animals `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Demo Cow","species":"Cattle","breed":"Gir","age":4,"weight":360}'
```

4. Edit `esp32_mavis_client.ino`:

```cpp
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SENSOR_API_URL = "http://YOUR_COMPUTER_IP:5000/api/sensor";
const char* ANIMAL_ID = "PASTE_ANIMAL_ID_HERE";
```

Do not use `localhost` in the ESP32 URL. Use your computer IP address.

## Sensor Pins

The sketch currently reads analog values from:

- `GPIO 34` for temperature
- `GPIO 35` for heart rate
- `GPIO 32` for blood oxygen
- `GPIO 33` for battery level

These mappings are placeholders so the full backend flow works. Replace the read functions in the sketch with the library code for your exact sensors, such as MAX30102, DS18B20, MLX90614, or DHT11/DHT22.

## Expected Flow

```text
ESP32 sensor readings
POST /api/sensor
MongoDB save
Risk score calculation
Live dashboard update
```

Open the dashboard at:

```text
http://localhost:5000
```
