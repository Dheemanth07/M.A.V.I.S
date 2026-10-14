# M.A.V.I.S. — Hardware Setup & Firmware Guide

This document describes the electrical wiring, sensor connections, firmware compilation, and field provisioning for the M.A.V.I.S. ESP32 smart collar.

---

## 1. Bill of Materials (BOM)

| Component | Purpose | Interface | Operating Voltage |
|---|---|---|---|
| **ESP32 DevKit v1** (WROOM-32) | Core Microcontroller (Dual Xtensa LX6 @ 240 MHz) | USB / 3.3V | 3.3V – 5V VIN |
| **MAX30102** | High-Sensitivity Optical Pulse Oximeter ($\text{SpO}_2$, HR, HRV) | Hardware I2C | 3.3V |
| **MPU6050** | 6-Axis Inertial Measurement Unit (Accelerometer + Gyroscope) | Hardware I2C | 3.3V |
| **DS18B20** | Waterproof Subcutaneous Digital Temperature Probe | 1-Wire | 3.3V – 5V |
| **4.7 kΩ Resistor** | 1-Wire Pull-up (Between DS18B20 Data and 3.3V) | Passive | — |
| **Two 100 kΩ Resistors** | 2:1 Voltage Divider for LiPo Battery Monitoring | Passive | — |
| **3.7V LiPo Battery** (18650 / Polymer) | Portable Power Supply (4.2V fully charged) | Power | 3.7V nominal |

---

## 2. Wiring & Pinout Reference

```text
       +------------------------------------------------------+
       |                   ESP32 WROOM-32                     |
       |                                                      |
       |  GPIO 21 (SDA) <--------+------> MAX30102 SDA        |
       |  GPIO 22 (SCL) <--------|------> MAX30102 SCL        |
       |                         +------> MPU6050 SDA         |
       |                         +------> MPU6050 SCL         |
       |                                                      |
       |  GPIO 4 (1-Wire) <-------------> DS18B20 Data        |
       |                           (+ 4.7kΩ pull-up to 3.3V)  |
       |                                                      |
       |  GPIO 34 (ADC1_CH6) <----------+ Center of 2:1       |
       |                                  100kΩ/100kΩ divider |
       |                                  from LiPo V_bat     |
       |                                                      |
       |  3.3V -------------------------> VCC (All Sensors)   |
       |  GND --------------------------> GND (Common Ground) |
       +------------------------------------------------------+
```

---

## 3. Firmware Architecture (`esp32_collar.ino`)

The firmware runs a concurrent dual-core FreeRTOS architecture:

```text
[ Core 1: APP_CPU ]                              [ Core 0: PRO_CPU ]
 taskBioSensors (Priority 2)                      taskTelemetry (Priority 1)
-----------------------------                    ----------------------------
- 100 Hz I2C PPG Acquisition                      - Receives latest TelemetryPacket
- Motion-Gated Peak Detection                       from atomic Queue (Mailbox)
- RMSSD HRV Calculation                          - Non-blocking HTTP POST to
- 6-Axis Chew Frequency DSP                        /api/sensor (3s cycle)
- Async 1-Wire Temperature                       - 15s Reconnection Backoff
- Battery ADC Sampling                           - 802.11 Modem Sleep Active
               |                                               ^
               +=======[ xQueueOverwrite (Size 1) ]============+
```

### Key Firmware Algorithms
1. **Motion-Gated Optical PPG**: Gates peak detection when acceleration magnitude exceeds $15\text{ m/s}^2$ or during rapid head shaking, preventing false heartbeats.
2. **True HRV ($\text{RMSSD}$)**: Root Mean Square of Successive Differences computed over an 8-beat rolling window:
   $$\text{RMSSD} = \sqrt{\frac{1}{N-1}\sum_{i=1}^{N-1} (RR_{i+1} - RR_i)^2}$$
3. **Beer-Lambert Optical $\text{SpO}_2$**: Physical derivation of arterial oxygenation from red and infrared AC/DC ratios:
   $$R = \frac{AC_{red}/DC_{red}}{AC_{ir}/DC_{ir}}, \quad \text{SpO}_2 = 110 - 25R$$
4. **Rumination Chew Frequency Detection**: Zero-crossing detection on Gyro Z ($0.25 \le |\omega_z| \le 1.8\text{ rad/s}$), converting jaw chew oscillations into chews per minute.
5. **I2C 9-Clock Bus Lockup Auto-Recovery**: Conforms to NXP UM10204 §3.1.16 standard to clear stuck slave shift registers after brownouts.
6. **Non-Blocking 1-Wire Conversion**: Configures DallasTemperature with `setWaitForConversion(false)` to eliminate the 750ms blocking freeze.

---

## 4. Compilation & Flashing Instructions

1. **Install Arduino IDE** (v2.0 or later) or PlatformIO.
2. **Add ESP32 Board URL** in Arduino IDE Preferences:
   ```text
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. **Install Required Libraries via Library Manager**:
   - `SparkFun MAX3010x Pulse and Proximity Sensor Library` (by SparkFun)
   - `Adafruit MPU6050` (by Adafruit)
   - `DallasTemperature` (by Miles Burton)
   - `OneWire` (by Paul Stoffregen)
   - `ArduinoJson` (v6.x or v7.x by Benoit Blanchon)
4. **Board Selection**: Select `ESP32 Dev Module` under Tools &rarr; Board.
5. **Compile & Flash**: Connect via USB, select COM port, and click **Upload**.

---

## 5. Field Provisioning (Captive Portal)

If the collar cannot connect to the configured Wi-Fi network, it automatically launches an Access Point:
1. Connect your phone or laptop to Wi-Fi hotspot: `MAVIS-COLLAR-SETUP`.
2. Open your browser and navigate to: `http://192.168.4.1`.
3. Select your farm Wi-Fi network from the live dynamic scan list, enter the Wi-Fi password, backend gateway URL, and Animal ID.
4. Click **Save & Connect Collar**. The collar stores the credentials in Non-Volatile Storage (NVS flash) and reboots into production station mode.
